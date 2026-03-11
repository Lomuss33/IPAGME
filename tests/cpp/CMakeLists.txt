cmake_minimum_required(VERSION 3.20)
project(ipagme_native_tests LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(subnet_engine_tests
  ../../src/wasm/subnet_engine.cpp
  test_engine.cpp
)

target_include_directories(subnet_engine_tests PRIVATE ../../src/wasm)

