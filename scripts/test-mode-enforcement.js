// Mocking auth and config for testing
const mockAuth = {
    currentUser: null
};

const mockConfig = {
    testerEmails: ['tester@example.com']
};

function getStripeMode(userEmail, whitelist) {
    if (userEmail && whitelist.includes(userEmail)) {
        return 'test';
    }
    return 'live';
}

function testModeEnforcement() {
    console.log("Running Mode Enforcement Tests...");

    // Test Case 1: Whitelisted User
    const mode1 = getStripeMode('tester@example.com', mockConfig.testerEmails);
    console.log(`Test Case 1 (Whitelisted): Expected 'test', Got '${mode1}'`);
    if (mode1 !== 'test') throw new Error("Test Case 1 Failed");

    // Test Case 2: Regular User
    const mode2 = getStripeMode('user@example.com', mockConfig.testerEmails);
    console.log(`Test Case 2 (Regular): Expected 'live', Got '${mode2}'`);
    if (mode2 !== 'live') throw new Error("Test Case 2 Failed");

    // Test Case 3: No User
    const mode3 = getStripeMode(null, mockConfig.testerEmails);
    console.log(`Test Case 3 (No User): Expected 'live', Got '${mode3}'`);
    if (mode3 !== 'live') throw new Error("Test Case 3 Failed");

    console.log("All Mode Enforcement Tests Passed!");
}

testModeEnforcement();
