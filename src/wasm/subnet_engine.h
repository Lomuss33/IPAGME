#ifndef IPAGME_SUBNET_ENGINE_H
#define IPAGME_SUBNET_ENGINE_H

#include <string>

namespace ipagme {

std::string generateQuestion(int seed, const std::string& difficulty, const std::string& addressFamily);
std::string evaluateAnswer(const std::string& questionJson, const std::string& answerText);
std::string calculateSubnet(const std::string& inputText, const std::string& addressFamily);
std::string getPowerTable(int maxBits);

}  // namespace ipagme

#endif

