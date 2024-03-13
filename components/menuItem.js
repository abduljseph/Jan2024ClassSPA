import html from "html-literal";

export default item => html`
  <li>${item.name} ($${item.price})</li>
`;
