
const testRegistration = async () => {
  try {
    console.log('Sending request to http://localhost:3000/api/register');
    const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'apitest',
            email: 'api@test.com',
            password: 'password123',
            confirmPassword: 'password123'
        })
    });
    
    console.log('Response Status:', response.status);
    const data = await response.text();
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
};

testRegistration();
