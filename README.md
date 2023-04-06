# Jonothan.dev

![Sreenshot of jonothan.dev](/jonothan_dev_screenshot.png)

This is [my website](https://jonothan.dev), created with [React](https://react.dev/) and [React Three Fiber](https://github.com/pmndrs/react-three-fiber) (which is a React renderer for [three.js](https://threejs.org/)).

## Setup

After cloning this repository, install packages and run:
```bash
yarn
yarn dev
```

## How it's put together

Vite which is a fabulous dev server (with insanely fast [Hot Module Replacement](https://vitejs.dev/guide/features.html#hot-module-replacement)!).

Recently switched from three.js to using React Three Fiber (R3F), which works really well with React (and can even [outperform](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) three.js on its own!).

Use of a bunch of very useful helpers and R3F abstractions from [Drei](https://github.com/pmndrs/drei).

Generally the interesting 3D stuff is in `src > components > experience` and any shaders are in `src > shaders`.


## On the to-do list

- Give experience clearer ARIA descriptions for screen readers and the like
- Add comments to all the new code since adopting R3F
- Optimise canvas and shader performance for mobile
- Centralise heavy useFrame usage across components that use live values eg. mouse and scroll.
- Change sampling and size of stickers to make them easier to read on smaller screens.
- Change the way rotation is controlled in the scene (right now it's a bit per / element and it could be mostly one central component)
- Probably a lot React optimisation generally!
