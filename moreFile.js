const apiKey = "12345-ABCDE";

function fetchUserData() {
    fetch(`https://api.example.com/data?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => console.log(data));
}

fetchUserData();  

console.log(apiKey);