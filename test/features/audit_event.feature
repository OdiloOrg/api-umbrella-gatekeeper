Feature: Audit Event

  Audit Client
  An applicantion/client wants to audit a given event to the service

  Background:
    Given Odilo Audit Service is available

  Scenario: Successful Audit Event
    Given an audit logger LoggerFactory
    And an audit event wit user "teamblue", operation "WRITE", resource with id "doc234" and type "DOCUMENT"
    When audit service is called
    Then receive a sucessfull audit event response
    And I check that has been audit

  Scenario: Failure, log error because Audit Service is not available
    Given an audit logger LoggerFactory
    And audit event service is not available
    When audit service is called
    Then I get a Logging error
