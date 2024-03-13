import html from "html-literal";
import menuItem from "../menuItem";

export default state => html`
  <section id="menu">
    <h2>Menu</h2>
    <ul>
      ${state.menuItems.map(item => menuItem(item)).join("")}
    </ul>
  </section>
`;
