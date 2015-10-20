Feature: Regular Logging

  Loggin Client
  An application/client wants to log during its execution

  Background:
    Given Odilo Audit Service is available

  Scenario: Successful Logging
    Given a logger LoggerFactory
    And a message "Prueba"
    When called to log it
    Then log without error
    And I check that has been logged

  Scenario: Failure, log error because Audit Service is not available
    Given a logger LoggerFactory
    And a message "Prueba"
    And Audit Service is not available
    When called to log it
    Then I get a Logging error
