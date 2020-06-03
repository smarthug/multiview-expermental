import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import _ from "lodash";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AutoSizer } from "react-virtualized";
import { v4 as uuid } from "uuid";
import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

let typeOfUpdate = "Add";
let isPaused = false;

const clock = new THREE.Clock();

const ResponsiveGridLayout = WidthProvider(Responsive);

let currentId = uuid().replace(/-/g, "");

const dLayout = [
  { i: currentId, x: 0, y: 0, w: 4, h: 4 },
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

const theGraphicStore = React.createRef();
theGraphicStore.current = {};

let uuidArr = React.createRef();
uuidArr.current = [currentId];

let scene, renderer, model, light, hemiLight;

init();

export default function Main() {
  const [layout, setLayout] = useState(dLayout);
  const [isDraggable, setIsDraggable] = useState(false);

  function Add() {
    typeOfUpdate = "Add";
    // 추가 하면서 기존의 거를 사이즈도 바꾸어줘야 되겠구나 ....
    //const id = uuid().replace(/-/g, "");
    currentId = uuid().replace(/-/g, "");
    uuidArr.current.push(currentId);
    setLayout([...layout, { i: currentId, x: 0, y: 0, w: 4, h: 4 }]);
  }

  function Remove(i) {
    isPaused = true;
    typeOfUpdate = "Remove";

    console.log("removef");
    console.log(i);

    delete theGraphicStore.current[i];

    _.remove(uuidArr.current, (uuid) => uuid === i);
    setLayout(_.reject(layout, { i: i }));
  }

  function onDragChange(e) {
    setIsDraggable(!isDraggable);
  }

  useEffect(() => {
    // init();
    isPaused = false;
  }, []);

  useEffect(() => {
    // remove 할때도 여기를 거치니 문제인듯 ...
    if (typeOfUpdate === "Add") {
      let tmpCam = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        5000
      );
      tmpCam.position.set(0, 25, 125);

      theGraphicStore.current[currentId].camera = tmpCam;

      theGraphicStore.current[currentId].control = new CameraControls(
        tmpCam,
        theGraphicStore.current[currentId].canvasRef
      );

     
    } else if (typeOfUpdate === "Remove") {
      isPaused = false;
    }

    animate();

    isPaused = false;
  }, [layout]);

  return (
    <div>
      <button onClick={Add}>Add</button>

      <input onChange={(e) => onDragChange(e)} type="checkbox"></input>
      <label for="isDraggable">isDraggable</label>
      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        style={{ height: "500" }}
        isDraggable={isDraggable}
      >
        {layout.map((v, i) => {
          return (
            <div key={v.i} data-grid={v}>
              <AutoSizer>
                {({ height, width }) => {
                  theGraphicStore.current[v.i] = {
                    ...theGraphicStore.current[v.i],
                    width: width,
                    height: height,
                  };

                  // isPaused = false

                  return (
                    <canvas
                      width={width}
                      height={height}
                      ref={(ref) =>
                        (theGraphicStore.current[v.i] = {
                          ...theGraphicStore.current[v.i],
                          canvasRef: ref,
                        })
                      }
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
  // snip
  const delta = clock.getDelta();

  if (isPaused) {
  } else {
    let currentLast = uuidArr.current.length - 1;
    if (
      theGraphicStore.current[uuidArr.current[currentLast]] &&
      theGraphicStore.current[uuidArr.current[currentLast]].width 
      // theGraphicStore.current[uuidArr.current[currentLast]].canvasRef
      // theGraphicStore.current[uuidArr.current[currentLast]].control
    ) {
      // eslint-disable-next-line array-callback-return
      Object.keys(theGraphicStore.current).map((v, i) => {
        let theGraphic = theGraphicStore.current[v];

        if (theGraphic.control) {

          const hasUpdated = theGraphic.control.update(delta);
          if(hasUpdated){

            theGraphic.camera.aspect = theGraphic.width / theGraphic.height;
            theGraphic.camera.updateProjectionMatrix();
            renderer.setSize(theGraphic.width, theGraphic.height);
            renderer.render(scene, theGraphic.camera);
            theGraphic.canvasRef
              .getContext("2d")
              .drawImage(renderer.domElement, 0, 0);
          }
        }
      });
    }
  }

  requestAnimationFrame(animate);
}
