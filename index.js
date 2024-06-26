import { Header, Nav, Main, Footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";
import axios from "axios";

const router = new Navigo("/");

function render(state = store.Home) {
  document.querySelector("#root").innerHTML = `
      ${Header(state)}
      ${Nav(store.Links)}
      ${Main(state)}
      ${Footer(store.Footer)}
    `;
  router.updatePageLinks();
  afterRender();
}

function afterRender() {
  // add menu toggle to bars icon in nav bar
  document.querySelector(".fa-bars").addEventListener("click", () => {
    document.querySelector("nav > ul").classList.toggle("hidden--mobile");
  });
}
if (st.view === "Order") {
  // Add an event handler for the submit button on the form
  document.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();

    // Get the form element
    const inputList = event.target.elements;
    console.log("Input Element List", inputList);

    // Create an empty array to hold the toppings
    const toppings = [];

    // Iterate over the toppings array

    for (let input of inputList.toppings) {
      // If the value of the checked attribute is true then add the value to the toppings array
      if (input.checked) {
        toppings.push(input.value);
      }
    }

    // Create a request body object to send to the API
    const requestData = {
      customer: inputList.customer.value,
      crust: inputList.crust.value,
      cheese: inputList.cheese.value,
      sauce: inputList.sauce.value,
      toppings: toppings
    };
    // Log the request body to the console
    console.log("request Body", requestData);

    axios
      // Make a POST request to the API to create a new pizza
      .post(`${process.env.PIZZA_PLACE_API_URL}/pizzas`, requestData)
      .then(response => {
      //  Then push the new pizza onto the Pizza state pizzas attribute, so it can be displayed in the pizza list
        store.Pizza.pizzas.push(response.data);
        router.navigate("/Pizza");
      })
      // If there is an error log it to the console
      .catch(error => {
        console.log("It puked", error);
      });
  });
}


router.hooks({
  before: (done, params) => {
    // We need to know what view we are on to know what data to fetch
    // const view = params && params.data && params.data.view ? capitalize(params.data.view) : "Home";
    let view = "Home";
    if (params && params.data && params.data.view) {
      view = capitalize(params.data.view);
    }

    // Add a switch case statement to handle multiple routes
    switch (view) {
      // Add a case for each view that needs data from an API
      case "Home":
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?APPID=${process.env.OPEN_WEATHER_MAP_API_KEY}&q=st. louis`
          )
          .then(response => {
            console.log(response);
            // Convert Kelvin to Fahrenheit since OpenWeatherMap does provide otherwise
            const kelvinToFahrenheit = kelvinTemp =>
              Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);

            // Create an object to be stored in the Home state from the response
            store.Home.weather = {
              city: response.data.name,
              temp: kelvinToFahrenheit(response.data.main.temp),
              feelsLike: kelvinToFahrenheit(response.data.main.feels_like),
              description: response.data.weather[0].main
            };
            done();
          });
        break;
      case "Pizza":
        // New Axios get request utilizing already made environment variable
        axios
          .get(`${process.env.PIZZA_PLACE_API_URL}/pizzas`)
          .then(response => {
            // We need to store the response to the state, in the next step but in the meantime let's see what it looks like so that we know what to store from the response.
            console.log("response", response);
            console.log("response data", response.data);

            store.Pizza.pizzas = response.data;

            done();
          })
          .catch(error => {
            console.log("It puked", error);
            done();
          });
        break;
      case "Menu":
        // Do stuff here
        done();
        break;
      default:
        done();
        break;
    }
  },
  already: params => {
    const view =
      params && params.data && params.data.view
        ? capitalize(params.data.view)
        : "Home";

    render(store[view]);
  }
});

router
  .on({
    "/": () => render(),
    ":view": params => {
      let view = capitalize(params.data.view);

      if (view in store) {
        render(store[view]);
      } else {
        render(store.Viewnotfound);
        console.log(`View ${view} not defined`);
      }
    }
  })
  .resolve();
