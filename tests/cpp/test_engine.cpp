#include "../../src/wasm/subnet_engine.h"

#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>

namespace {

void assertContains(const std::string& haystack, const std::string& needle, const std::string& message) {
  if (haystack.find(needle) == std::string::npos) {
    throw std::runtime_error(message + "\nExpected to find: " + needle + "\nIn: " + haystack);
  }
}

void runKnownAnswerTests() {
  const std::string resultA = ipagme::calculateSubnet("192.168.54.201/26", "ipv4");
  assertContains(resultA, "\"network\":\"192.168.54.192\"", "Expected /26 network match.");

  const std::string resultB = ipagme::calculateSubnet("10.44.199.3/20", "ipv4");
  assertContains(resultB, "\"network\":\"10.44.192.0\"", "Expected /20 network match.");

  const std::string resultC = ipagme::calculateSubnet("172.16.130.99/17", "ipv4");
  assertContains(resultC, "\"network\":\"172.16.128.0\"", "Expected /17 network match.");
}

void runEdgeCaseTests() {
  const std::string result31 = ipagme::calculateSubnet("10.0.0.8/31", "ipv4");
  assertContains(result31, "\"usableHosts\":2", "Expected /31 usable host semantics.");

  const std::string result32 = ipagme::calculateSubnet("10.0.0.8/32", "ipv4");
  assertContains(result32, "\"usableHosts\":1", "Expected /32 usable host semantics.");

  const std::string result0 = ipagme::calculateSubnet("10.0.0.8/0", "ipv4");
  assertContains(result0, "\"network\":\"0.0.0.0\"", "Expected /0 network semantics.");
}

void runAnswerTests() {
  const std::string question = ipagme::generateQuestion(42, "easy", "ipv4");
  const size_t networkStart = question.find("\"network\":\"");
  if (networkStart == std::string::npos) {
    throw std::runtime_error("Generated question did not include network.");
  }

  const size_t valueStart = networkStart + 11;
  const size_t valueEnd = question.find('"', valueStart);
  const std::string network = question.substr(valueStart, valueEnd - valueStart);

  const std::string correctAnswer = ipagme::evaluateAnswer(question, network);
  assertContains(correctAnswer, "\"isCorrect\":true", "Expected correct answer match.");

  const std::string prefixedAnswer = ipagme::evaluateAnswer(question, network + "/24");
  assertContains(prefixedAnswer, "\"isCorrect\":true", "Expected optional prefix to be tolerated.");

  const std::string invalidAnswer = ipagme::evaluateAnswer(question, "999.1.1.1");
  assertContains(invalidAnswer, "\"isCorrect\":false", "Expected invalid IPv4 rejection.");
}

void runPowerTableTests() {
  const std::string table = ipagme::getPowerTable(8);
  assertContains(table, "\"exponent\":0", "Expected first power row.");
  assertContains(table, "\"value\":128", "Expected 2^7 value.");
}

}  // namespace

int main() {
  try {
    runKnownAnswerTests();
    runEdgeCaseTests();
    runAnswerTests();
    runPowerTableTests();
  } catch (const std::exception& error) {
    std::cerr << error.what() << '\n';
    return EXIT_FAILURE;
  }

  std::cout << "Native subnet engine tests passed.\n";
  return EXIT_SUCCESS;
}

