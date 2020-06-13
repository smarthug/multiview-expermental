import React, { useState, useEffect } from "react";
// import { Responsive, WidthProvider } from "react-grid-layout";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles.css";
import _ from "lodash";
import * as THREE from "three";
import { AutoSizer } from "react-virtualized";
import { v4 as uuid } from "uuid";
import CameraControls from "camera-controls";

//export { getItems } from "./toolBar";

CameraControls.install({ THREE: THREE });

let typeOfUpdate = "Add";
let isPaused = false;

const clock = new THREE.Clock();

// const ResponsiveGridLayout = WidthProvider(Responsive);

let currentId = uuid().replace(/-/g, "");

const dLayout = [
    { i: currentId, x: 0, y: 0, w: 4, h: 4 }
    // { i: 2, x: 4, y: 0, w: 4, h: 4 },
    // { i: 3, x: 0, y: 4, w: 4, h: 4 },
    // { i: 4, x: 4, y: 4, w: 4, h: 4 },
];

const removeStyle = {
    position: "absolute",
    right: "2px",
    top: 0,
    cursor: "pointer"
};

//const theGraphicStore = React.createRef();
let theGraphicStore = {};
//theGraphicStore = {};
// theGraphicStore[currentId] = {};

let uuidArr = React.createRef();
uuidArr.current = [currentId];

let scene, renderer;

export let graphicUpdater = () => {};
export let GlobalScene = { add: () => {}, children: [] };
export function ClearScene() {
    scene.children = [];
}
export function clearThree(scene) {
    //console.log(scene.children.filter(({ type }) => type === "Mesh"));
    if (scene.children.length === 0) {
        return;
    }
    disposeGeo(scene);
}

function disposeGeo(item) {
    while (item.children.length > 0) {
        disposeGeo(item.children[0]);
        item.remove(item.children[0]);
    }
    if (item.geometry) item.geometry.dispose();
}

export function ClearThreeWrapper() {
    //console.log(GlobalScene);

    clearThree(scene);

    scene.children = [];
}
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
        setLayout([...layout, { i: currentId, x: 4, y: 0, w: 4, h: 4 }]);
    }

    function Render() {
        console.log(theGraphicStore);
        //const delta = clock.getDelta();
        // eslint-disable-next-line array-callback-return
        uuidArr.current.map((v, i) => {
            let theGraphic = theGraphicStore[v];

            if (theGraphic.control) {
                theGraphic.camera.aspect = theGraphic.width / theGraphic.height;
                theGraphic.camera.updateProjectionMatrix();
                renderer.setSize(theGraphic.width, theGraphic.height);

                renderer.render(scene, theGraphic.camera);
                theGraphic.canvasRef
                    .getContext("2d")
                    .drawImage(renderer.domElement, 0, 0);
            }
        });
    }

    function Remove(i) {
        isPaused = true;
        typeOfUpdate = "Remove";

        console.log("removef");
        console.log(i);

        theGraphicStore[i].control.dispose();
        console.log(theGraphicStore);

        console.log(uuidArr.current);
        _.remove(uuidArr.current, uuid => uuid === i);
        console.log(uuidArr.current);

        setLayout(_.reject(layout, { i: i }));
    }

    function Resizer(height = 100, width = 100, uuid = currentId) {
        theGraphicStore[uuid] = {
            ...theGraphicStore[uuid],
            width: width,
            height: height
        };

        // isPaused = false
        console.log(uuid);
        return (
            <canvas
                width={width}
                height={height}
                ref={ref =>
                    (theGraphicStore[uuid] = {
                        ...theGraphicStore[uuid],
                        canvasRef: ref
                    })
                }></canvas>
        );
    }

    function onDragChange(e) {
        setIsDraggable(!isDraggable);
        // isPaused = !isPaused;
    }

    useEffect(() => {
        // init();
        isPaused = false;

        // setTimeout(() => {
        //   let theGraphic = theGraphicStore[currentId];

        //   theGraphic.camera.aspect = theGraphic.width / theGraphic.height;
        //   theGraphic.camera.updateProjectionMatrix();
        //   renderer.setSize(theGraphic.width, theGraphic.height);
        //   renderer.render(scene, theGraphic.camera);
        //   theGraphic.canvasRef
        //     .getContext("2d")
        //     .drawImage(renderer.domElement, 0, 0);
        // }, 10);
        graphicUpdater = Render;

        animate();
    }, []);

    useEffect(() => {
        // remove 할때도 여기를 거치니 문제인듯 ...
        if (typeOfUpdate === "Add") {
            let tmpCam = new THREE.PerspectiveCamera(
                70,
                0.9036612426035503,
                1,
                1.7976931348623157e8
            );
            //perspectiveCamera.position.z = 15000;

            tmpCam.up.set(0, 0, 1);
            tmpCam.position.set(0, 0, 15000);

            theGraphicStore[currentId].camera = tmpCam;

            let control = new CameraControls(
                tmpCam,
                theGraphicStore[currentId].canvasRef
            );
            // 클수록 뻑뻑해짐. damping == 제동
            // control.dampingFactor = 0.7;
            // control.draggingDampingFactor = 0.7;

            theGraphicStore[currentId].control = control;

            // setTimeout(() => {
            //   let theGraphic = theGraphicStore[currentId];

            //   theGraphic.camera.aspect = theGraphic.width / theGraphic.height;
            //   theGraphic.camera.updateProjectionMatrix();
            //   renderer.setSize(theGraphic.width, theGraphic.height);
            //   renderer.render(scene, theGraphic.camera);
            //   theGraphic.canvasRef
            //     .getContext("2d")
            //     .drawImage(renderer.domElement, 0, 0);
            // }, 10);
        } else if (typeOfUpdate === "Remove") {
            isPaused = false;
        }
        console.log(theGraphicStore);
    }, [layout]);

    return (
        <div style={{ display: "block", width: "100%" }}>
            <button onClick={Render}>Render</button>
            <button onClick={Add}>Add</button>

            <input onChange={e => onDragChange(e)} type="checkbox"></input>
            <label for="isDraggable">isDraggable</label>
            <GridLayout
                className="layout"
                // breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                // width={800}
                style={{ height: 0 }}
                isDraggable={isDraggable}
                cols={24}
                width={4800}
                // height={857}
                compactType={"horizontal"}>
                {layout.map((v, i) => {
                    console.log(layout);
                    return (
                        <div key={v.i} data-grid={v}>
                            <AutoSizer>
                                {({ height, width }) =>
                                    Resizer(height, width, v.i)
                                }
                            </AutoSizer>
                            <span
                                className="remove"
                                style={removeStyle}
                                onClick={el => Remove(v.i)}>
                                x
                            </span>

                            {v.i}
                        </div>
                    );
                })}
            </GridLayout>
        </div>
    );
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    GlobalScene = scene;

    renderer = new THREE.WebGLRenderer({ antialias: true, autoClear: true });
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 2.3;
    renderer.shadowMap.enabled = true;

    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    scene.add(new THREE.AxesHelper(500));
}

// 핵심 ...
function animate() {
    // snip
    const delta = clock.getDelta();

    if (isPaused) {
        console.log("paused");
    } else {
        // console.log("animate!")
        // let currentLast = uuidArr.current.length - 1;

        // eslint-disable-next-line array-callback-return
        uuidArr.current.map((v, i) => {
            //let theGraphic = theGraphicStore[v];

            if (theGraphicStore[v].control) {
                const hasUpdated = theGraphicStore[v].control.update(delta);
                if (hasUpdated) {
                    theGraphicStore[v].camera.aspect =
                        theGraphicStore[v].width / theGraphicStore[v].height;
                    theGraphicStore[v].camera.updateProjectionMatrix();
                    renderer.setSize(
                        theGraphicStore[v].width,
                        theGraphicStore[v].height
                    );

                    renderer.render(scene, theGraphicStore[v].camera);
                    theGraphicStore[v].canvasRef
                        .getContext("2d")
                        .drawImage(renderer.domElement, 0, 0);
                }
            }
        });
    }

    requestAnimationFrame(animate);
}