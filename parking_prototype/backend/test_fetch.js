async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: "hello",
              systemInstruction: "test" 
            })
        });
        const data = await response.json();
        console.log("SUCCESS:", data);
    } catch (error) {
        console.error("ERROR:", error);
    }
}
test();
