Feature: Regular Logging

  As Gatekeeper
  I send all my generated logs to Audit Service

  Background:
    Given Odilo Audit Service is available

  Scenario Outline: Successful Logging
    Given I want to call <service>
    When I call it with <request>
    Then I check that <response> has been audited
    Examples:
      | service    | request | response                       |
      | /hello.xml |  ""    | "<code>API_KEY_MISSING</code>" |


#  Scenario: Failure, log error because Audit Service is not available
#    Given a logger LoggerFactory
#    And a message "Prueba"
#    And Audit Service is not available
#    When called to log it
#    Then I get a Logging error
