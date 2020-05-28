import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import _ from "lodash";
import * as THREE from "three";

const ResponsiveGridLayout = WidthProvider(Responsive);

const dLayout = [
  { i: "1", x: 0, y: 0, w: 4, h: 4 },
  // { i: 2, x: 4, y: 0, w: 4, h: 4 },
  // { i: 3, x: 0, y: 4, w: 4, h: 4 },
  // { i: 4, x: 4, y: 4, w: 4, h: 4 },
];

const removeStyle = {
  position: "absolute",
  right: "2px",
  top: 0,
  cursor: "pointer",
};

let canvasRefArray = React.createRef();
canvasRefArray.current = [];
let numOfCanvas = 1;
let scene, camera, renderer;

export default function Main() {
  const [layout, setLayout] = useState(dLayout);

  function Add() {
    // 추가 하면서 기존의 거를 사이즈도 바꾸어줘야 되겠구나 ....
    numOfCanvas++;
    setLayout([...layout, { i: `${numOfCanvas}`, x: 8, y: 4, w: 4, h: 4 }]);
    console.log(layout);
  }

  function Remove(i) {
    console.log("removef");
    console.log(i);
    //console.log(el.target.value)
    numOfCanvas--;
    setLayout(_.reject(layout, { i: i }));
  }

  useEffect(() => {
    init();
    animate();
  }, []);
  useEffect(() => {
    console.log(canvasRefArray.current);

    
  }, [layout]);

  function onResize(cb){
    //auto sizer 넣어야겠네 ㅋㅋ
    console.log(cb)
  }

  return (
    <div style={{}}>
      <button onClick={Add}>Add</button>
      <ResponsiveGridLayout
        className="layout"
        // layout={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        // width={1200}
        style={{ height: "500" }}
        // isDraggable={false}
        // rowHeight={30}
        // maxRows={4}
        // autoSize={false}
        // maxRows={2}
        onResizeStop={onResize}
      >
        {layout.map((v, i) => {
          return (
            <div key={v.i} data-grid={v}>
              {v.i}
              <span
                className="remove"
                style={removeStyle}
                onClick={(el) => Remove(v.i)}
              >
                x
              </span>
              <canvas width={400} height={400} ref={(ref) => (canvasRefArray.current[i] = ref)}></canvas>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}

// autosizer 도 넣어줘야 겠네 ....
// 일단 r3f 를 안넣고 만들자 .... 귀찮아 죽겠다 ...

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  // 망함 각각마다 renderer 사이즈 다 다르게 해야되잖아 ....
  // 일단 쉬운 방법은 1 , 2, 4 일때의 고정이 있다 .... 4가지가 다 모두 사이즈 같기에 ...
  // 오버 테크놀로지 일까 ...
  renderer.setSize(400, 400);

  let geometry = new THREE.BoxGeometry();
  let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  canvasRefArray.current.map((v, i) => {
    //v.get
    // renderer.domElement 를 그려주기 .
    // 이게 애니메이트에서 돌아가야할듯 ...
    v.getContext("2d").drawImage(renderer.domElement, 0,0)
    return null;
  });
}
