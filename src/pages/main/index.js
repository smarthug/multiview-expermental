import React, { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import _ from "lodash";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AutoSizer } from "react-virtualized";

import CameraControls from "camera-controls";
CameraControls.install({ THREE: THREE });

const clock = new THREE.Clock();

const ResponsiveGridLayout = WidthProvider(Responsive);

const dLayout = [
  { i: "0", x: 0, y: 0, w: 4, h: 4 },
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

// 결국 종합적인 모든걸 관리하는 객체 array ...
//let test =  {[numOfCanvas]:{canvasRef: 3 ,canvasSize: {width: 3, height: 43}, camera:4, control:43}}
let theGraphicArray = React.createRef();
theGraphicArray.current = [];

let canvasRefArray = React.createRef();
canvasRefArray.current = [];

let canvasSizeArray = React.createRef();
canvasSizeArray.current = [];

let cameraArray = React.createRef();
cameraArray.current = [];

let controlArray = React.createRef();
controlArray.current = [];

let numOfCanvas = 0;
let scene, renderer, model, light, hemiLight;

// let isDraggable = false;

export default function Main() {
  const gridLayoutRef = useRef();
  const [layout, setLayout] = useState(dLayout);
  const [isDraggable, setIsDraggable] = useState(false);

  function Add() {
    // 추가 하면서 기존의 거를 사이즈도 바꾸어줘야 되겠구나 ....
    numOfCanvas++;
    setLayout([...layout, { i: `${numOfCanvas}`, x: 0, y: 0, w: 4, h: 4 }]);
    console.log(layout);
  }

  // function ControlMaker() {}

  function Remove(i) {
    console.log("removef");
    console.log(i);
    //console.log(el.target.value)
    numOfCanvas--;
    // 하나로 묶자...
    // 이제 i 라는 아이디를 지우는 방식으로 ... 
    canvasRefArray.current.splice(i);
    canvasSizeArray.current.splice(i);
    cameraArray.current.splice(i);
    controlArray.current.splice(i);
    setLayout(_.reject(layout, { i: i }));
  }

  function onDragChange(e) {
    setIsDraggable(!isDraggable);
  }

  useEffect(() => {
    init();

    animate();
  }, []);

  useEffect(() => {
    let tmpCam = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );
    tmpCam.position.set(0, 25, 125);
    // numOfCanvas 쓰는게 문제일려나 ....
    cameraArray.current[numOfCanvas] = tmpCam;

    controlArray.current[numOfCanvas] = new CameraControls(
      tmpCam,
      canvasRefArray.current[numOfCanvas]
    );
    // 문제 구나 .....
    // cameraArray.current.push(tmpCam);

    // controlArray.current[numOfCanvas] = new CameraControls(
    //   tmpCam,
    //   canvasRefArray.current[numOfCanvas]
    // );
    // 배열이 아니라 오브젝트로 가야되나 ????
    // 오브젝트로 가자 ....
    // 순서는 중요치 않다 , 페어로 묶여만 있다면 .. 
  }, [layout]);

  return (
    <div style={{}}>
      <button onClick={Add}>Add</button>

      <input onChange={(e) => onDragChange(e)} type="checkbox"></input>
      <label for="isDraggable">isDraggable</label>
      <ResponsiveGridLayout
        className="layout"
        // layout={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        // width={1200}
        style={{ height: "500" }}
        isDraggable={isDraggable}
        // rowHeight={30}
        // maxRows={4}
        // autoSize={false}
        // maxRows={2}

        ref={gridLayoutRef}
      >
        {layout.map((v, i) => {
          return (
            <div key={v.i} data-grid={v}>
              <AutoSizer>
                {({ height, width }) => {
                  if (renderer) {
                    //renderer.setSize(width, height);
                    canvasSizeArray.current[i] = { width, height };
                  }
                  return (
                    <canvas
                      width={width}
                      height={height}
                      ref={(ref) => (canvasRefArray.current[i] = ref)}
                    ></canvas>
                  );
                }}
              </AutoSizer>
              <span
                className="remove"
                style={removeStyle}
                onClick={(el) => Remove(v.i)}
              >
                x
              </span>

              {v.i}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddddd);

  renderer = new THREE.WebGLRenderer();
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setSize(400, 400);
  renderer.shadowMap.enabled = true;

  let geometry = new THREE.BoxGeometry();
  let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  let cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  scene.add(new THREE.AxesHelper(500));

  light = new THREE.SpotLight(0xffa95c, 4);
  light.position.set(-50, 50, 50);
  light.castShadow = true;
  light.shadow.bias = -0.0001;
  light.shadow.mapSize.width = 1024 * 4;
  light.shadow.mapSize.height = 1024 * 4;
  scene.add(light);

  hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
  scene.add(hemiLight);

  let loader = new GLTFLoader();
  loader.load("./model/scene.gltf", (result) => {
    console.log(result);
    model = result.scene.children[0];
    model.position.set(0, -5, -25);
    model.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material.map) n.material.map.anisotropy = 1;
      }
    });
    scene.add(model);
  });
}



// 핵심 ... 
function animate() {
  requestAnimationFrame(animate);

  // snip
  const delta = clock.getDelta();

  canvasRefArray.current.map((v, i) => {
    if (v && canvasSizeArray.current[i] && cameraArray.current[i]) {
      // 최적화기법
      // const hasControlsUpdated = controlArray.current[i].update(delta);

      // if (hasControlsUpdated) {
      //   let tmpSize = canvasSizeArray.current[i];
      //   cameraArray.current[i].aspect = tmpSize.width / tmpSize.height;
      //   cameraArray.current[i].updateProjectionMatrix();
      //   renderer.setSize(tmpSize.width, tmpSize.height);
      //   renderer.render(scene, cameraArray.current[i]);
      //   v.getContext("2d").drawImage(renderer.domElement, 0, 0);
      // }

      controlArray.current[i].update(delta);

      let tmpSize = canvasSizeArray.current[i];
      cameraArray.current[i].aspect = tmpSize.width / tmpSize.height;
      cameraArray.current[i].updateProjectionMatrix();
      renderer.setSize(tmpSize.width, tmpSize.height);
      renderer.render(scene, cameraArray.current[i]);
      v.getContext("2d").drawImage(renderer.domElement, 0, 0);
    }
    return null;
  });
}
