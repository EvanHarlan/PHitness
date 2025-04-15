import fetch from 'node-fetch';

const registerTestUser = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "testpassword123"
      })
    });

    console.log('Register Response Status:', response.status);
    const data = await response.json();
    console.log('Register Response:', data);
    return data;
  } catch (error) {
    console.error('Register error:', error.message);
    // If user already exists, that's fine - we'll try to log in anyway
    return null;
  }
};

const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    // Log the full response for debugging
    console.log('Login Response Status:', response.status);
    console.log('All Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    const responseData = await response.json();
    console.log('Login Response Body:', responseData);

    // Get the cookies from the response headers
    const cookies = response.headers.get('set-cookie');
    console.log('Raw cookies:', cookies);
    
    if (!cookies) {
      throw new Error('No cookies received from login');
    }

    // Extract just the access token cookie
    const accessTokenCookie = cookies.split(', ').find(cookie => cookie.startsWith('accessToken='));
    if (!accessTokenCookie) {
      throw new Error('No access token cookie found');
    }

    // Return just the access token cookie
    return accessTokenCookie;
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

const testMealPlan = async () => {
  try {
    // First, try to register a test user
    console.log('Attempting to register test user...');
    await registerTestUser();

    // Then, log in with the test user credentials
    console.log('Attempting to log in...');
    const accessTokenCookie = await login('test@example.com', 'testpassword123');
    console.log('Successfully logged in');

    // Now make the meal plan request
    console.log('Generating meal plan...');
    const response = await fetch('http://localhost:5000/api/meal-plans/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': accessTokenCookie
      },
      body: JSON.stringify({
        goal: "gain muscle",
        targetCalories: 2800,
        targetProtein: 180,
        targetCarbs: 300,
        targetFats: 90,
        preferences: ["chicken", "brown rice", "broccoli"],
        dietaryRestrictions: ["no dairy"]
      })
    });

    console.log('Response Status:', response.status);
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testMealPlan();
