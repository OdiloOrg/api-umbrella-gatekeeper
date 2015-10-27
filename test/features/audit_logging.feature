Feature: System Logging

  As Gatekeeper
  I send all my generated logs to Audit Service

  Background:
    Given Odilo Audit Service is available

  Scenario Outline: Successful Request Logging
    Given I want to call <service>
    When I call it
    Then I check that it has been audited
    Examples:
      | service    |
      | /hello.xml |
