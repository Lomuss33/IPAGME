#include "subnet_engine.h"

#include <algorithm>
#include <array>
#include <cctype>
#include <cstdint>
#include <optional>
#include <random>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

namespace ipagme {
namespace {

struct ParsedAddress {
  uint32_t ip = 0;
  int prefix = 0;
};

struct SubnetDetails {
  uint32_t ip = 0;
  int prefix = 0;
  uint32_t mask = 0;
  uint32_t wildcard = 0;
  uint32_t network = 0;
  uint32_t broadcast = 0;
  uint32_t blockSize = 0;
  int focusOctet = 1;
  std::array<std::string, 4> binaryOctets;
  uint64_t usableHosts = 0;
  uint32_t firstHost = 0;
  uint32_t lastHost = 0;
};

std::string trim(const std::string& text) {
  size_t start = 0;
  while (start < text.size() && std::isspace(static_cast<unsigned char>(text[start]))) {
    ++start;
  }

  size_t end = text.size();
  while (end > start && std::isspace(static_cast<unsigned char>(text[end - 1]))) {
    --end;
  }

  return text.substr(start, end - start);
}

std::string jsonEscape(const std::string& value) {
  std::ostringstream stream;

  for (const char c : value) {
    switch (c) {
      case '\\':
        stream << "\\\\";
        break;
      case '"':
        stream << "\\\"";
        break;
      case '\n':
        stream << "\\n";
        break;
      case '\r':
        stream << "\\r";
        break;
      case '\t':
        stream << "\\t";
        break;
      default:
        stream << c;
        break;
    }
  }

  return stream.str();
}

std::string errorJson(const std::string& message) {
  return "{\"error\":\"" + jsonEscape(message) + "\"}";
}

uint32_t prefixToMask(const int prefix) {
  if (prefix <= 0) {
    return 0;
  }

  if (prefix >= 32) {
    return 0xFFFFFFFFu;
  }

  return 0xFFFFFFFFu << (32 - prefix);
}

std::array<int, 4> splitOctets(const uint32_t value) {
  return {
      static_cast<int>((value >> 24) & 0xFFu),
      static_cast<int>((value >> 16) & 0xFFu),
      static_cast<int>((value >> 8) & 0xFFu),
      static_cast<int>(value & 0xFFu),
  };
}

std::string formatIpv4(const uint32_t value) {
  const auto octets = splitOctets(value);
  return std::to_string(octets[0]) + "." + std::to_string(octets[1]) + "." + std::to_string(octets[2]) + "." +
         std::to_string(octets[3]);
}

std::string formatBinaryOctet(const int value) {
  std::string output;
  output.reserve(8);
  for (int bit = 7; bit >= 0; --bit) {
    output.push_back(((value >> bit) & 1) == 1 ? '1' : '0');
  }
  return output;
}

std::optional<ParsedAddress> parseIpv4(const std::string& input, const bool requirePrefix, const bool allowOptionalPrefix) {
  const std::string trimmed = trim(input);
  if (trimmed.empty()) {
    return std::nullopt;
  }

  const size_t slashIndex = trimmed.find('/');
  std::string ipPart = trimmed;
  std::string prefixPart;

  if (slashIndex != std::string::npos) {
    ipPart = trimmed.substr(0, slashIndex);
    prefixPart = trimmed.substr(slashIndex + 1);
  } else if (requirePrefix) {
    return std::nullopt;
  } else if (!allowOptionalPrefix) {
    prefixPart.clear();
  }

  std::array<uint32_t, 4> octets = {0, 0, 0, 0};
  size_t start = 0;

  for (int index = 0; index < 4; ++index) {
    const size_t end = ipPart.find('.', start);
    const bool lastOctet = index == 3;
    if ((!lastOctet && end == std::string::npos) || (lastOctet && end != std::string::npos)) {
      return std::nullopt;
    }

    const std::string token = ipPart.substr(start, lastOctet ? std::string::npos : end - start);
    if (token.empty() || token.size() > 3) {
      return std::nullopt;
    }

    for (const char c : token) {
      if (!std::isdigit(static_cast<unsigned char>(c))) {
        return std::nullopt;
      }
    }

    const int value = std::stoi(token);
    if (value < 0 || value > 255) {
      return std::nullopt;
    }

    octets[index] = static_cast<uint32_t>(value);
    start = end + 1;
  }

  int prefix = 32;
  if (!prefixPart.empty()) {
    for (const char c : prefixPart) {
      if (!std::isdigit(static_cast<unsigned char>(c))) {
        return std::nullopt;
      }
    }

    prefix = std::stoi(prefixPart);
    if (prefix < 0 || prefix > 32) {
      return std::nullopt;
    }
  } else if (requirePrefix) {
    return std::nullopt;
  }

  const uint32_t ip = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  return ParsedAddress{ip, prefix};
}

SubnetDetails calculateDetails(const uint32_t ip, const int prefix) {
  SubnetDetails details;
  details.ip = ip;
  details.prefix = prefix;
  details.mask = prefixToMask(prefix);
  details.wildcard = ~details.mask;
  details.network = ip & details.mask;
  details.broadcast = details.network | details.wildcard;

  int focusOctet = (prefix / 8) + 1;
  if (prefix == 32) {
    focusOctet = 4;
  } else if (prefix % 8 == 0 && prefix < 32) {
    focusOctet = std::min(4, (prefix / 8) + 1);
  }
  details.focusOctet = std::clamp(focusOctet, 1, 4);

  if (prefix == 32) {
    details.blockSize = 1;
  } else if (prefix % 8 == 0) {
    details.blockSize = 256;
  } else {
    const int hostBitsInFocusOctet = 8 - (prefix % 8);
    details.blockSize = 1u << hostBitsInFocusOctet;
  }

  const auto ipOctets = splitOctets(ip);
  for (size_t index = 0; index < details.binaryOctets.size(); ++index) {
    details.binaryOctets[index] = formatBinaryOctet(ipOctets[index]);
  }

  const int hostBits = 32 - prefix;
  if (prefix == 32) {
    details.usableHosts = 1;
    details.firstHost = ip;
    details.lastHost = ip;
  } else if (prefix == 31) {
    details.usableHosts = 2;
    details.firstHost = details.network;
    details.lastHost = details.broadcast;
  } else {
    details.usableHosts = hostBits == 32 ? 4294967294ull : ((1ull << hostBits) - 2ull);
    details.firstHost = details.network + 1u;
    details.lastHost = details.broadcast - 1u;
  }

  return details;
}

std::string extractJsonString(const std::string& json, const std::string& key) {
  const std::string pattern = "\"" + key + "\":\"";
  const size_t start = json.find(pattern);
  if (start == std::string::npos) {
    return "";
  }

  std::string output;
  bool escaped = false;
  size_t index = start + pattern.size();

  while (index < json.size()) {
    const char c = json[index++];
    if (escaped) {
      output.push_back(c);
      escaped = false;
      continue;
    }

    if (c == '\\') {
      escaped = true;
      continue;
    }

    if (c == '"') {
      break;
    }

    output.push_back(c);
  }

  return output;
}

int extractJsonInt(const std::string& json, const std::string& key) {
  const std::string pattern = "\"" + key + "\":";
  const size_t start = json.find(pattern);
  if (start == std::string::npos) {
    return 0;
  }

  size_t index = start + pattern.size();
  size_t end = index;
  while (end < json.size() && (std::isdigit(static_cast<unsigned char>(json[end])) || json[end] == '-')) {
    ++end;
  }

  return std::stoi(json.substr(index, end - index));
}

std::string difficultyToBand(std::mt19937& engine, const std::string& difficulty) {
  if (difficulty == "easy" || difficulty == "medium" || difficulty == "hard") {
    return difficulty;
  }

  std::uniform_int_distribution<int> bandDistribution(0, 99);
  const int choice = bandDistribution(engine);
  if (choice < 45) {
    return "easy";
  }
  if (choice < 80) {
    return "medium";
  }
  return "hard";
}

int prefixForDifficulty(std::mt19937& engine, const std::string& difficulty) {
  if (difficulty == "easy") {
    std::uniform_int_distribution<int> distribution(24, 30);
    return distribution(engine);
  }
  if (difficulty == "medium") {
    std::uniform_int_distribution<int> distribution(16, 23);
    return distribution(engine);
  }

  std::uniform_int_distribution<int> distribution(8, 15);
  return distribution(engine);
}

std::string buildExplanation(const uint32_t ip, const SubnetDetails& details) {
  const int focusIndex = details.focusOctet - 1;
  const auto ipOctets = splitOctets(ip);
  const auto networkOctets = splitOctets(details.network);
  const auto broadcastOctets = splitOctets(details.broadcast);
  std::ostringstream stream;

  stream << "With /" << details.prefix << ", the subnet mask is " << formatIpv4(details.mask) << ". ";

  if (details.prefix % 8 == 0 && details.prefix != 32) {
    stream << "The network boundary lands on octet " << details.focusOctet << ", so full octets stay fixed and the next octet resets to 0.";
  } else {
    stream << "Block size " << details.blockSize << " in octet " << details.focusOctet << " means "
           << ipOctets[focusIndex] << " falls inside the " << networkOctets[focusIndex] << "-"
           << broadcastOctets[focusIndex] << " subnet window.";
  }

  return stream.str();
}

std::string buildQuestionJson(const SubnetDetails& details, const std::string& difficulty) {
  std::ostringstream stream;
  stream << "{"
         << "\"addressFamily\":\"ipv4\","
         << "\"difficulty\":\"" << difficulty << "\","
         << "\"ip\":\"" << formatIpv4(details.ip) << "\","
         << "\"prefix\":" << details.prefix << ","
         << "\"network\":\"" << formatIpv4(details.network) << "\","
         << "\"broadcast\":\"" << formatIpv4(details.broadcast) << "\","
         << "\"subnetMask\":\"" << formatIpv4(details.mask) << "\","
         << "\"wildcardMask\":\"" << formatIpv4(details.wildcard) << "\","
         << "\"blockSize\":" << details.blockSize << ","
         << "\"focusOctet\":" << details.focusOctet << ","
         << "\"binaryOctets\":["
         << "\"" << details.binaryOctets[0] << "\","
         << "\"" << details.binaryOctets[1] << "\","
         << "\"" << details.binaryOctets[2] << "\","
         << "\"" << details.binaryOctets[3] << "\""
         << "]"
         << "}";
  return stream.str();
}

std::string buildCalculatorJson(const SubnetDetails& details) {
  std::ostringstream stream;
  stream << "{"
         << "\"addressFamily\":\"ipv4\","
         << "\"ip\":\"" << formatIpv4(details.ip) << "\","
         << "\"prefix\":" << details.prefix << ","
         << "\"network\":\"" << formatIpv4(details.network) << "\","
         << "\"broadcast\":\"" << formatIpv4(details.broadcast) << "\","
         << "\"firstHost\":\"" << formatIpv4(details.firstHost) << "\","
         << "\"lastHost\":\"" << formatIpv4(details.lastHost) << "\","
         << "\"usableHosts\":" << details.usableHosts << ","
         << "\"subnetMask\":\"" << formatIpv4(details.mask) << "\","
         << "\"wildcardMask\":\"" << formatIpv4(details.wildcard) << "\","
         << "\"blockSize\":" << details.blockSize << ","
         << "\"focusOctet\":" << details.focusOctet << ","
         << "\"binarySplit\":{"
         << "\"networkBits\":" << details.prefix << ","
         << "\"octets\":["
         << "\"" << details.binaryOctets[0] << "\","
         << "\"" << details.binaryOctets[1] << "\","
         << "\"" << details.binaryOctets[2] << "\","
         << "\"" << details.binaryOctets[3] << "\""
         << "]"
         << "}"
         << "}";
  return stream.str();
}

}  // namespace

std::string generateQuestion(const int seed, const std::string& difficulty, const std::string& addressFamily) {
  if (addressFamily != "ipv4") {
    return errorJson("Only IPv4 is supported in this release.");
  }

  std::mt19937 engine(static_cast<uint32_t>(seed));
  const std::string band = difficultyToBand(engine, difficulty);
  const int prefix = prefixForDifficulty(engine, band);
  const uint32_t mask = prefixToMask(prefix);
  const int hostBits = 32 - prefix;
  const uint32_t hostSpace = 1u << hostBits;

  std::uniform_int_distribution<uint32_t> networkDistribution(0u, 0xFFFFFFFFu);
  const uint32_t randomNetwork = networkDistribution(engine) & mask;
  std::uniform_int_distribution<uint32_t> hostDistribution(1u, hostSpace - 2u);
  const uint32_t ip = randomNetwork + hostDistribution(engine);

  const SubnetDetails details = calculateDetails(ip, prefix);
  return buildQuestionJson(details, band);
}

std::string evaluateAnswer(const std::string& questionJson, const std::string& answerText) {
  const std::string ipText = extractJsonString(questionJson, "ip");
  const std::string networkText = extractJsonString(questionJson, "network");
  const int prefix = extractJsonInt(questionJson, "prefix");

  const auto parsedIp = parseIpv4(ipText + "/" + std::to_string(prefix), true, false);
  if (!parsedIp) {
    return errorJson("The provided question payload is invalid.");
  }

  const SubnetDetails details = calculateDetails(parsedIp->ip, prefix);
  const auto parsedAnswer = parseIpv4(answerText, false, true);

  std::ostringstream stream;
  stream << "{";

  if (!parsedAnswer) {
    stream << "\"isCorrect\":false,"
           << "\"submitted\":\"" << jsonEscape(trim(answerText)) << "\","
           << "\"normalizedSubmitted\":\"\","
           << "\"correctNetwork\":\"" << networkText << "\","
           << "\"explanation\":\"" << jsonEscape("Enter a dotted-decimal IPv4 address such as 192.168.54.192.") << "\"";
    stream << "}";
    return stream.str();
  }

  const std::string normalizedSubmitted = formatIpv4(parsedAnswer->ip);
  const bool isCorrect = normalizedSubmitted == networkText;

  stream << "\"isCorrect\":" << (isCorrect ? "true" : "false") << ","
         << "\"submitted\":\"" << jsonEscape(trim(answerText)) << "\","
         << "\"normalizedSubmitted\":\"" << normalizedSubmitted << "\","
         << "\"correctNetwork\":\"" << networkText << "\","
         << "\"explanation\":\"" << jsonEscape(buildExplanation(parsedIp->ip, details)) << "\"";
  stream << "}";
  return stream.str();
}

std::string calculateSubnet(const std::string& inputText, const std::string& addressFamily) {
  if (addressFamily != "ipv4") {
    return errorJson("Only IPv4 is supported in this release.");
  }

  const auto parsed = parseIpv4(inputText, true, false);
  if (!parsed) {
    return errorJson("Enter a valid IPv4 address in CIDR form, for example 10.44.199.3/20.");
  }

  const SubnetDetails details = calculateDetails(parsed->ip, parsed->prefix);
  return buildCalculatorJson(details);
}

std::string getPowerTable(const int maxBits) {
  const int safeBits = std::clamp(maxBits, 1, 32);
  std::ostringstream stream;
  stream << "[";

  for (int bit = 0; bit < safeBits; ++bit) {
    if (bit > 0) {
      stream << ",";
    }

    const uint64_t value = 1ull << bit;
    stream << "{\"exponent\":" << bit << ",\"value\":" << value << "}";
  }

  stream << "]";
  return stream.str();
}

}  // namespace ipagme

#ifdef __EMSCRIPTEN__
using namespace emscripten;

EMSCRIPTEN_BINDINGS(ipagme_module) {
  function("generateQuestion", &ipagme::generateQuestion);
  function("evaluateAnswer", &ipagme::evaluateAnswer);
  function("calculateSubnet", &ipagme::calculateSubnet);
  function("getPowerTable", &ipagme::getPowerTable);
}
#endif
