const list = document.getElementById("links");

fetch("list.json")
  .then((response) => response.json())
  .then((sites) => {
    sites.forEach((site) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <img src="${site.icon}" alt="${site.name} icon" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 8px;">
          <a href="${site.url}" target="_blank" rel="noopener noreferrer">${site.name}</a>
        `;
      list.appendChild(li);
    });
  })
  .catch((error) => {
    console.error("Error loading site list:", error);
    list.innerHTML = "<li>Failed to load links.</li>";
  });
