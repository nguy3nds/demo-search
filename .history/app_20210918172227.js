const QUERY_URL =
  "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&limit=10&format=json&search=";
const TITTLE_URL =
  "https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageprops|pageimages&format=json&titles=";
const WIKI = "https://en.wikipedia.org/wiki/";
const input = document.querySelector("input");
const searchList = document.querySelector(".search-list");

function getData(url, fn) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        fn(undefined, JSON.parse(xhr.responseText));
      } else {
        fn(new Error(xhr.statusText), undefined);
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

const onKeyUp = () => {
  const inputValue = input.value;

  async function run() {
    const listItem = []; // Khai báo danh sách các Item sẽ in ra html

    const listResultOfSearch = await new Promise((resolve, reject) => {
      getData(QUERY_URL + inputValue, (e, data) => resolve(data));
    });

    const listTittle = listResultOfSearch[1]; // Lấy ra 1 mảng các title

    const listInfo = await Promise.all(
      listTittle.map(
        (tittle) =>
          new Promise((resolve, reject) => {
            getData(TITTLE_URL + tittle, (e, data) => resolve(data));
          })
      )
    );

    searchList.innerHTML = ""; // Xóa trắng màn hình trước khi in ra kết quả mới

    listInfo.forEach((info) => {
      const keyArray = Object.keys(info.query.pages); // Lấy danh sách các key của object info.query.pages
      const key = keyArray[0]; // Lấy key đầu tiên của danh sách key trên

      const item = info.query.pages[key]; // Lấy value của key trên

      const { title, thumbnail, pageprops } = item;
      const link = title.split(" ").join("_"); // đổi title thành link

      const a = document.createElement("a");
      a.className = "search-item";
      a.setAttribute("href", WIKI + link);

      const image = document.createElement("img");
      if (typeof thumbnail === "object" && thumbnail.hasOwnProperty("source")) {
        image.src = thumbnail.source;
      } else image.src = "";
      a.appendChild(image);

      const divInfo = document.createElement("div");

      const titleElement = document.createElement("h4");
      titleElement.innerHTML = title;
      divInfo.appendChild(titleElement);

      const decsElement = document.createElement("p");
      decsElement.innerHTML = pageprops["wikibase-shortdesc"];
      divInfo.appendChild(decsElement);

      a.appendChild(divInfo);

      searchList.appendChild(a);
    });
  }
  run();
};
