const React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag === "function") {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise.then(data => {
          suspenseCache.set(key, data);
          rerender();
        });

        return { tag: "h1", props: { children: ["LOADING"] } };
      }
    }

    const element = { tag, props: { ...props, children } };
    return element;
  }
};

const render = (reactElement, root) => {
  const domElement = document.createElement(reactElement.tag);

  if (["string", "number"].includes(typeof reactElement)) {
    root.append(document.createTextNode(String(reactElement)));
    return;
  }

  if (reactElement.props) {
    const { props } = reactElement;
    Object.keys(props)
      .filter(p => p !== "children")
      .forEach(p => (domElement[p] = reactElement.props[p]));
  }

  if (reactElement.props.children) {
    const { children } = reactElement.props;
    children.forEach(child => render(child, domElement));
  }

  root.appendChild(domElement);
};

let states = [];
let stateCounter = 0;

const useState = initalState => {
  let stateCounterCopy = stateCounter;
  states[stateCounterCopy] = states[stateCounterCopy] || initalState;

  const setNewState = newState => {
    states[stateCounterCopy] = newState;
    rerender();
  };

  stateCounter++;

  return [states[stateCounterCopy], setNewState];
};

const rerender = () => {
  stateCounter = 0;
  document.querySelector("#app").firstChild.remove();
  render(<App />, document.getElementById("app"));
};

const suspenseCache = new Map();
const createResource = (promise, key) => {
  if (suspenseCache.has(key)) {
    return suspenseCache.get(key);
  }

  throw {
    promise,
    key
  };
};

const App = () => {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  const dogPhoto = createResource(
    fetch("https://dog.ceo/api/breeds/image/random")
      .then(res => res.json())
      .then(p => p.message),
    "dogPhotoKey"
  );

  return (
    <div className="root">
      <div>
        <h1 className="test">HELLO, {name}!</h1>
        <input
          type="text"
          onchange={e => setName(e.target.value)}
          value={name}
          placeholder={"name"}
        />
      </div>
      <div>
        <p>{count}</p>
        <button onclick={e => setCount(count + 1)}>+</button>
        <button onclick={e => setCount(count - 1)}>-</button>
      </div>
      <img src={dogPhoto} alt="" srcset="" />
      <p>
        This "application" is an implementation of how react works under the
        hood.
      </p>
      <ul>
        <strong>CURRENT FEATURES</strong>
        <li>Basic Rendering</li>
        <li>Hooks</li>
        <ul>
          <li>Use State</li>
        </ul>
        <li>Concurrent mode</li>
        <ul>
          <li>Suspense</li>
        </ul>
      </ul>
    </div>
  );
};

render(<App />, document.getElementById("app"));
