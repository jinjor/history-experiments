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

function init(route, path, state) {
  time++;
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
  if (route) {
    out.textContent = 'loading...';
    init(route, path, state).then(data => {
      history.replaceState(data, null, path);
      out.textContent = route.render(data);
    }).catch(() => {});
  }
}

function handleClick(e) {
  e.preventDefault();
  const path = e.target.href;
  if (path === location.href) {
    return;
  }
  history.pushState(null, null, path);
  doRouting(path);
}

[a, b].forEach(element => {
  element.addEventListener('click', handleClick);
});

window.addEventListener('popstate', e => {
  doRouting(location.pathname, e.state);
});

doRouting(location.pathname)
