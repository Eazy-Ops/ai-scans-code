//key is storen in env variable securely
const apiKey = process.env.api_key;
console.log(apiKey)

async function fetchUserData() {
  const apiUrl = "https://api.example.com/data";
  
  try {
    //do a request
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json", 
      }, 
    });

    //Handle error
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    document.getElementById("output").innerText = "Failed to fetch data.";
  }
}