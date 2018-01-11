// Emulate fetching data from server which takes a long time.
function getData(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        id: id,
        name: 'Foo'
      });
    }, 2000);
  });
}

// Each route definition has 3 functions.
//
// 1. `match: urlstring => boolean`
// 2. `init: urlstring => Promise<data>`
// 3. `render: data => string`
//
const routes = [{
  match: path => path.endsWith('/a'),
  init: path => getData(1),
  render: data => JSON.stringify(data)
}, {
  match: path => path.endsWith('/b'),
  init: path => getData(2),
  render: data => JSON.stringify(data)
}, {
  match: path => true,
  init: path => Promise.resolve(),
  render: () => 'no content'
}];

function getRoute(path) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (route.match(path)) {
      return route;
    }
  }
  return null;
}

let time = 0;
// This function wraps route.init and judge if url has been changed during loading.
// If the url has been changed, the loaded data will be thrown away.
function init(route, path, state) {
  time++;
  // If history has state, immediately resolve with it.
  if (state) {
    return Promise.resolve(state);
  }
  const t = time;
  return route.init(path).then(data => {
    if (t === time) {
      return Promise.resolve(data);
    } else {
      return Promise.reject();
    }
  })
}

function doRouting(path, state) {
  const route = getRoute(path);
  if (!route) {
    return;
  }
  out.textContent = 'loading...';
  init(route, path, state).then(data => {
    // Override state with loaded data without pushing new history.
    history.replaceState(data, null, path);
    out.textContent = route.render(data);
  }).catch(() => {});
}

function handleClick(e) {
  // Disable browser's default navigation.
  e.preventDefault();
  const path = e.target.href;
  if (path === location.href) {
    return;
  }
  // If url changed, push new history and wait for data that will be
  // asynchronously loaded.
  history.pushState(null, null, path);
  doRouting(path);
}

[a, b].forEach(element => {
  element.addEventListener('click', handleClick);
});

// Subscribe back/forward action.
window.addEventListener('popstate', e => {
  doRouting(location.pathname, e.state);
});

// Initial navigation.
doRouting(location.pathname)
