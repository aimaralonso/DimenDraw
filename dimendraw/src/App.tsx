import React, { useEffect } from 'react';
import './Graphic.css'
//import './script';
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


import paperFull from "paper";
import { view } from "paper/dist/paper-core";

const Workk: React.FC = () => {
  useEffect(() => {


    // Extender prototipos de Three.js
    /* THREE.Mesh.prototype.raycast = acceleratedRaycast;
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree; */


    const paper = paperFull;


    // Instalar Paper.js en el objeto window
    //paper.install(window);

    // Variables globales
    let pathsArray: paper.Path[] = []; // Almacena todos los caminos dibujados


    let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;


    let currentMovingPath: paper.Path | null = null;


    let wallHelperPath: paper.Path;
    let drawPared = true;


    let modifyTool: paper.Tool, drawTool: paper.Tool, eraseTool: paper.Tool;


    const originalWarn = console.warn;
    console.warn = function (message) {
      if (
        message.includes(
          "ExtendedTriangle.intersectsTriangle: Triangles are coplanar"
        )
      ) {
        return; // No mostrar este warning específico
      }
      originalWarn.apply(console, [...arguments]); // O: Array.from(arguments)
    };


    const initApp = () => {
      const modal = document.getElementById("popupModal");
      const container = document.getElementById("canvas3D");
      const myCanvas = document.getElementById("myCanvas");
      const header = document.getElementById("modal-content");


      if (modal) {
        // Inicializa el modal oculto
        modal.style.display = "none"; // Oculta el modal completamente


        // Mostrar temporalmente el modal para calcular sus dimensiones
        modal.style.visibility = "hidden"; // No visible para el usuario
        modal.style.display = "block"; // Solo se usa para calcular el tamaño
      }


      if (container) {
        // Obtener las dimensiones del contenedor Three.js dentro del modal
        const clientWidth = container.clientWidth;
        const clientHeight = container.clientHeight;
        // Función definida en otro lugar que inicializa Three.js
        init(clientWidth, clientHeight);
      }


      animate(); // Función definida en otro lugar


      if (modal)
        // Volver a ocultar el modal hasta que el usuario lo abra
        modal.style.display = "none";


      const openBtn = document.getElementById("openModalBtn");
      // Agregar evento para abrir el modal cuando se haga clic en el botón
      if (openBtn)
        openBtn.addEventListener("click", function () {
          updateGeometry(); // Función definida en otro lugar
          if (modal) {
            modal.style.display = "block";
            modal.style.visibility = "visible"; // Hacerlo visible para el usuario
          }
        });


      const close = document.querySelector(".close");
      // Agregar evento para cerrar el modal
      if (close && modal)
        close.addEventListener("click", function () {
          modal.style.display = "none";
        });


      let isDragging = false;
      let offsetX: number, offsetY: number;
      if (header)
        // Detectar cuando el usuario hace clic en la parte superior del modal
        header.addEventListener("mousedown", (event) => {
          isDragging = true;
          if (modal) {
            offsetX = event.clientX - modal.offsetLeft;
            offsetY = event.clientY - modal.offsetTop;
          } else {
            offsetX = event.clientX;
            offsetY = event.clientY;
          }
          // Cambiar el cursor para indicar que se puede arrastrar
          header.style.cursor = "grabbing";
        });


      if (container)
        // Impedir que el clic en el canvas cierre el modal
        container.addEventListener("mousedown", (event) => {
          event.stopPropagation();
        });


      if (myCanvas)
        myCanvas.addEventListener("mousedown", () => {
          if (modal) modal.style.display = "none"; // Cierra el modal al hacer clic en el canvas
        });


      // Mover el modal mientras se arrastra
      document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        // Calcular la nueva posición
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;
        if (modal) {
          modal.style.left = `${x}px`;
          modal.style.top = `${y}px`;
        }
      });


      // Soltar el modal cuando se suelta el botón del mouse
      document.addEventListener("mouseup", () => {
        isDragging = false;
        if (header) header.style.cursor = "grab";
      });


      // Cerrar el modal si el clic es fuera de él
      document.addEventListener("click", (event) => {
        if (event.target === modal && modal) {
          modal.style.display = "none";
        }
      });
      // Inicialización y configuración de Paper.js y sus herramientas


      // Herramientas de Paper.js


      // Función para alternar entre los lienzos


      const closeSpan: HTMLElement | null = document.getElementById("close");
      //const closeSpan:Element|null|HTMLElement = document.getElementsByClassName("close")[0];
      if (openBtn !== null && modal !== null) {
        openBtn.onclick = function () {
          modal.style.display = "block";
        };
      }
      // Abrir el modal


      if (closeSpan !== null && modal !== null) {
        // Cerrar al hacer clic en la "X"
        closeSpan.onclick = function () {
          modal.style.display = "none";
        };
      }


      // Configurar el canvas de Paper.js
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;


      paper.setup(canvas);


      wallHelperPath = new paper.Path({
        strokeColor: "blue",
        strokeWidth: 2,
      });
      wallHelperPath.visible = false;
      paper.settings.handleSize = 10;


      // Crear una capa exclusiva para la cuadrícula y colocarla en el fondo
      // Crear capas
      let gridLayer = new paper.Layer();
      gridLayer.name = "GridLayer"; // Capa de la cuadrícula


      let mainLayer = new paper.Layer();
      mainLayer.name = "MainLayer"; // Capa principal de dibujo
      function exportSVG() {
        const jsonData = paper.project.exportJSON({ asString: false });
        const jsonString = JSON.stringify(jsonData, null, 2); // bonito con indentación


        const jsonBlob = new Blob([jsonString], { type: "application/json" });
        const jsonLink = document.createElement("a");
        jsonLink.href = URL.createObjectURL(jsonBlob);
        jsonLink.download = "proyecto.json";
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);


        // 2. Exportar SVG
        const svgString: string = paper.project.exportSVG({ asString: true }) as string;
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const svgLink = document.createElement("a");
        svgLink.href = URL.createObjectURL(svgBlob);
        svgLink.download = "proyecto.svg";
        document.body.appendChild(svgLink);
        svgLink.click();
        document.body.removeChild(svgLink);
      }


      // Asigna el evento click al botón para exportar
      const exportt = document.getElementById("exportSvgBtn");
      if (exportt) exportt.addEventListener("click", exportSVG);
      function importJSONFile(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        console.log("PAtth", pathsArray);
        const file = input.files[0];
        const reader = new FileReader();


        reader.onload = function (e) {
          const content = e.target?.result as string;
          try {
            const json = JSON.parse(content);
            paper.project.clear(); // Limpia el proyecto actual
            pathsArray.length = 0;
            pathsArray = [];
            updateGeometry();
            paper.project.importJSON(json); // Importa el nuevo
            collectWallsFromProject();
            console.log("Nuevo", pathsArray);
            paper.view.update(); // Actualiza la vista
            console.log("Proyecto", paper.project);
            console.log("Proyecto cargado desde JSON");
          } catch (error) {
            console.error("Error al importar el JSON:", error);
          }
        };


        reader.readAsText(file);


        updateGeometry();

      }
      function collectWallsFromProject() {
        pathsArray.length = 0; // limpia el array antes de llenarlo


        paper.project.layers.forEach((layer) => {
          layer.children.forEach((item) => {
            collectNamedPaths(item, "wall", pathsArray);
          });
        });
      }


      function collectNamedPaths(
        item: paper.Item,
        targetName: string,
        output: paper.Path[]
      ) {
        if (item instanceof paper.Path && item.name === targetName) {
          output.push(item);
        } else if (item instanceof paper.Group || item instanceof paper.Layer) {
          item.children.forEach((child) =>
            collectNamedPaths(child, targetName, output)
          );
        }
      }
      const importt = document.getElementById("fileInput");
      // Asigna el evento change al input de archivo para cargar SVG
      if (importt) importt.addEventListener("change", importJSONFile);
      function drawGrid() {
        gridLayer.activate();
        gridLayer.removeChildren(); // Eliminar cuadrícula previa


        const gridSpacing = 30;
        const gridColor = new paper.Color(0.9, 0.9, 0.9);


        let canvasWidth = paper.view.size.width;
        let canvasHeight = paper.view.size.height;
        // Líneas verticales
        for (let x = 0; x < canvasWidth; x += gridSpacing) {
          let line = new paper.Path.Line({
            from: new paper.Point(x, 0),
            to: new paper.Point(x, canvasHeight),
            strokeColor: gridColor,
            name: "X",
          });
          gridLayer.addChild(line);
        }


        // Líneas horizontales
        for (let y = 0; y < canvasHeight; y += gridSpacing) {
          let line = new paper.Path.Line({
            from: new paper.Point(0, y),
            to: new paper.Point(canvasWidth, y),
            strokeColor: gridColor,
            name: "Y",
          });
          gridLayer.addChild(line);
        }


        mainLayer.activate(); // Regresar a la capa principal
      }


      // Redibujar cuadrícula al cambiar el tamaño del viewport
      paper.view.onResize = function () {
        paper.project.activeLayer.position = view.center;
        //drawGrid();
      };
      paper.view.onFrame = function () { };


      // Dibujar cuadrícula inicialmente
      drawGrid();


      const hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5,
      };


      let segment: paper.Segment | null, path: paper.Path | null;
      let movePath = false;


      function removeText() {
        paper.project
          .getItems({ class: paper.PointText })
          .forEach(function (textItem: paper.Item | null) {
            if (textItem) textItem.remove();
            textItem = null;
          });
        const marcadorArc = paper.project.activeLayer.children.filter(
          (item) => item.name === "arc"
        );
        marcadorArc.forEach((marker) => marker.remove());
      }
      let lastMousePosition: paper.Point | null = null;
      // Eventos para la herramienta de modificación


      modifyTool.onMouseDown = function (event: paper.ToolEvent) {
        deselectAllPaths();
        segment = path = null;


        let hitResult = paper.project.hitTest(event.point, hitOptions);
        if (!hitResult) {
          // Si no se hace click en ningún objeto, ocultamos el input y limpiamos la selección
          return;
        }
        //Que no se pueda seleccionar el grid
        if (hitResult.item.name === "X" || hitResult.item.name === "Y") {

          return;
        }
        let marcadorArc: paper.Item[] | null =
          paper.project.activeLayer.children.filter((item) => item.name === "arc");
        marcadorArc.forEach((marker) => marker.remove());
        marcadorArc = null;
        if (hitResult) {
          console.log("2d seleccionado:", hitResult);
          paper.project
            .getItems({ class: paper.PointText })
            .forEach((textItem) => {
              if (textItem instanceof paper.PointText && textItem.data.pathId !== hitResult.item.id) {
                textItem.remove();
              }
            });


          if (hitResult.item instanceof paper.Path)
            path = hitResult.item;


          if (hitResult.type === "segment") {
            segment = hitResult.segment;
            if (event.modifiers.option && segment) {
              lastMousePosition = event.point.clone(); // Guarda la posición inicial del mouse
            }
          }


          if (hitResult.item.name === "wall" && path) {
            path.sendToBack();

            if (!hitResult.item.data.height2d) {
              hitResult.item.data.height2d = 5;
            }
          }


          var item = hitResult.item;
          var content = "";


          // Si ya existe un texto para este objeto, se elimina
          if (item.data && item.data.dimensionText) {
            item.data.dimensionText.remove();
            item.data.dimensionText = null;
          }


          // Dependiendo del tipo de objeto, se muestra su medida
          if (item instanceof paper.Path) {
            measureAndDisplay(item);
          }


          // Calcular posición: arriba del objeto
          // Si el objeto tiene bounds, posicionamos el texto en el centro del ancho y 10 unidades por encima del top.
          var textPosition;
          if (item.bounds) {
            textPosition = new paper.Point(
              item.bounds.center.x,
              item.bounds.top - 10
            );
          } else {
            // Si no tiene bounds, usamos la posición del click como fallback
            textPosition = event.point.add(new paper.Point(10, -10));
          }


          // Crear el texto en el canvas para mostrar la información
          var text = new paper.PointText({
            point: textPosition,
            content: content,
            fillColor: "black",
            fontSize: 12,
          });


          // Almacenar la referencia del texto en la propiedad data del objeto
          item.data = item.data || {};
          item.data.dimensionText = text;
          // Eliminar el texto después de 3 segundos
          setTimeout(function () {
            if (item.data && item.data.dimensionText) {
              item.data.dimensionText.remove();
              item.data.dimensionText = null;
            }
          }, 3000);
        }


        // Si se ha hecho click sobre el área de relleno, se considera que se va a mover
        movePath = hitResult.type === "fill";
        if (hitResult.item.data.grupo) {
          hitResult.item.remove();
        }
        if (movePath && hitResult.item instanceof paper.Path) {
          // Traer el path al frente y marcarlo como en movimiento
          currentMovingPath = hitResult.item;

        }
      };


      modifyTool.onMouseMove = function (event: paper.ToolEvent) {
        paper.project.activeLayer.selected = false;
        if (event.item) {
          if (
            event.item.name === "X" ||
            event.item.name === "Y" ||
            event.item.name === "GridLayer"
          ) {
            event.item.selected = false;
          } else {
            event.item.selected = true;
          }
        }
      };


      modifyTool.onMouseDrag = function (event: paper.ToolEvent) {
        eliminarPathsTemporales();


        paper.project
          .getItems({ class: paper.PointText })
          .forEach(function (textItem) {
            textItem.remove();
          });
       /*  if (selectionGroup) {
          selectionGroup.position = selectionGroup.position.add(event.delta);
        } */
        if (event.modifiers.option && segment && path) {
          if (lastMousePosition) {
            let center = path.position; // Centro del path para rotar


            // Vectores desde el centro hasta la posición anterior y actual del mouse
            let prevVector = lastMousePosition.subtract(center);
            let currentVector = event.point.subtract(center);


            // Calcular el ángulo de rotación entre los dos vectores
            let angle = currentVector.angle - prevVector.angle;


            // Aplicar la rotación al path
            path.rotation = angle;


            // Actualizar la última posición del mouse
            lastMousePosition = event.point.clone();
          }
        } else if (path) {
          // Mover el rectángulo y el grupo
          path.position = path.position.add(event.delta);

        }


        // Actualizar la geometría y las intersecciones
        updateGeometry();
      };


      modifyTool.onMouseUp = function () {
        if (currentMovingPath) {
          currentMovingPath = null;
        }
        // Opcional: actualizar intersecciones generales al soltar
      };


      // Funciones auxiliares para las herramientas de dibujo y borrado
      let startPoint: paper.Point | null = null;
      const addAndMoveToolDown = function (event: paper.ToolEvent) {
        startPoint = event.point;
        path = new paper.Path.Rectangle(startPoint, new paper.Size(0, 0));
        if (drawPared == true) {
          path.strokeColor = new paper.Color(0, 0, 1, 0.5); // Color azul con opacidad
        }



      };


      const addAndMoveToolDrag = function (event: paper.ToolEvent) {
        if (startPoint) {
          let rectangle = new paper.Rectangle(startPoint, event.point);
          if (path) path.remove();
          path = new paper.Path.Rectangle(rectangle, new paper.Size(0, 0));
          path.name = "wall";
          path.data.startPoint = startPoint;


          if (drawPared == true) {
            path.data.behaviour = "pared";
            path.strokeColor = new paper.Color(0, 0, 1, 0.5); // Color azul con opacidad
          }
          path.strokeWidth = 5;

        }
        if (wallHelperPath) {
          wallHelperPath.remove();
        }
        wallHelperPath = new paper.Path({
          strokeColor: "blue",
          strokeWidth: 2,
        });
        wallHelperPath.add(event.point);
        wallHelperPath.visible = true;
      };


      // Eventos para el dibujo
      drawTool.onMouseDown = addAndMoveToolDown;


      drawTool.onMouseDrag = addAndMoveToolDrag;



      //let selectionGroup: paper.Group | null;
      let height2d = 5;
      drawTool.onMouseUp = function (event: paper.ToolEvent) {
        if (path) {
          // Modo dibujo normal
          path.data.height2d = height2d;
          path.fillColor = drawPared ? new paper.Color(1, 0, 0) : new paper.Color(0, 0, 1, 0.5);
          path.data.lastPoint = event.point;
          path.closePath();

          pathsArray.push(path);

        }

      };


      // Eventos para la herramienta de borrado
      eraseTool.onMouseDown = function (event: paper.ToolEvent) {

        if (!event.item) {
          return;
        }
        /* 
        
                let grupo = findGroupContainingChild(event.item);
                if (grupo !== null) {
                  grupo.remove();
                  console.log("EEE")
                  event.item.remove();
                }
        
         */
        // Eliminar el objeto 2D si existe en los arrays
        pathsArray = pathsArray.filter((item) => item !== event.item);

        if ((event.item.name = "wall")) {
          event.item.remove;
        }
        // Eliminar el item 2D del proyecto
        event.item.remove();
        removeText();
        walls3d = walls3d.filter((mesh) => {
          let path2d = paper.project.getItem({ id: mesh.userData.pathId });


          if (!path2d) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            return false;
          }


          return true; // Si aún tiene path en 2D, lo dejamos
        });
        // Actualizar la escena
        // Forzar actualización del render si usas Three.js
        renderer.render(scene, camera);
      };
      eraseTool.onMouseMove = function (event: paper.ToolEvent) {
        paper.project.activeLayer.selected = false;
        if (event.item) {

          if (event.item.name === "X" || event.item.name === "Y") {
            event.item.selected = false;
          }
          else {
            event.item.selected = true;
          }
        }
      };
  /*     function findGroupContainingChild(child: paper.Item) {
        // Obtener todos los grupos en el proyecto
        const groups = paper.project.getItems({ class: paper.Group });


        // Buscar un grupo que contenga el elemento como hijo
        return groups.find((group) => group.children.includes(child)) || null;
      } */


      function eliminarPathsTemporales() {
        // Buscamos todos los items con el nombre 'temporal'
        var itemsTemporales = paper.project.getItems({ tiempo: "temporal" });


        // Si se encuentran, se eliminan
        if (itemsTemporales.length > 0) {
          itemsTemporales.forEach(function (item) {
            item.remove();
          });
        }
      }



      const drawBtn = document.getElementById("drawBtn");
      const eraseBtn = document.getElementById("eraseBtn");
      // Eventos de los botones HTML
      if (drawBtn)
        drawBtn.addEventListener("click", function () {
          drawTool.activate();
        });
      if (eraseBtn)
        eraseBtn.addEventListener("click", function () {
          eraseTool.activate();
        });
      const modifyBtn = document.getElementById("modifyBtn");
      if (modifyBtn)
        modifyBtn.addEventListener("click", function () {
          modifyTool.activate();
        });


      // Activar la herramienta de dibujo por defecto
      drawTool.activate();
    };


    // Si el DOM ya está cargado, ejecuta la inicialización directamente; de lo contrario, espera a DOMContentLoaded.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initApp);
    } else {
      modifyTool = new paper.Tool();
      drawTool = new paper.Tool();
      eraseTool = new paper.Tool();
      initApp();
    }


    // Inicialización y configuración de Paper.js y sus herramientas


    var measurements: paper.PointText[] = [];
    let newLayer;
    // Función que elimina los textos anteriores y crea nuevos textos de medida
    function measureAndDisplay(path: paper.Path) {
      for (var i = 0; i < measurements.length; i++) {
        measurements[i].remove();
      }
      measurements = [];


      for (var i = 0; i < path.segments.length; i++) {
        var seg = path.segments[i];
        var nextSeg = path.segments[(i + 1) % path.segments.length];


        // Vector del lado y su longitud
        var vector = nextSeg.point.subtract(seg.point);
        var length = vector.length;


        // Punto medio del segmento
        var midPoint = seg.point.add(vector.divide(2));


        // Creamos un vector perpendicular para desplazar el texto
        var perpendicular = vector.clone().rotate(90, new paper.Point(0, 0)).normalize(20);
        var testPoint = midPoint.add(perpendicular);


        if (path.contains(testPoint)) {
          perpendicular = perpendicular.multiply(-1);
        }
        var labelPoint = midPoint.add(perpendicular);


        // Creamos el texto con la longitud
        var lengthText = new paper.PointText({
          point: labelPoint,
          content: length.toFixed(2),
          fillColor: "blue",
          fontSize: 14,
          justification: "center",
        });
        lengthText.data.pathId = path.id;
        lengthText.name = "X";
        // Obtenemos el ángulo del vector para orientar el texto
        var textAngle = vector.angle; // en grados


        // Ajustamos el ángulo para que el texto no se gire:
        if (textAngle > 90 || textAngle < -90) {
          textAngle += 180;
        }
        lengthText.rotation = textAngle;


        measurements.push(lengthText);
      }
      if (path.data.grupo !== true || !path.data.grupo) {
        var centerPoint = path.bounds.center;


        // Crea el texto en el centro
        var centerText = new paper.PointText({
          point: centerPoint,
          content: path.data.height2d.toFixed(2),
          fillColor: "blue",
          fontSize: 16,
          justification: "center",
        });
        centerText.data.pathId = path.id;
        centerText.name = "X";
        //centerText.bringToFront()
        newLayer = new paper.Layer();
        newLayer.name = "newLayer";
        newLayer.addChild(centerText);
        newLayer.activate(); // Activa la nueva capa
        newLayer.bringToFront();


        // Opcional: Agregar el texto central al array de mediciones si deseas manejarlo junto a los demás
        measurements.push(centerText);
      }
      return measurements;
    }


    let walls3d: THREE.Mesh[] = [];
    // Inicialización de Three.js
    function init(width: number, height: number) {
      const container = document.getElementById("canvas3D")!;
      container.innerHTML = "";

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb0b0b0);


      camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
      camera.position.set(0, 0, 200);


      const group = new THREE.Group();
      scene.add(group);


      const helper = new THREE.GridHelper(160, 10);
      helper.rotation.x = Math.PI / 2;
      group.add(helper);


      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);


      //  Ajustar el tamaño del renderer al tamaño del modal
      renderer.setSize(width, height);
      if (container) container.appendChild(renderer.domElement);


      new OrbitControls(camera, renderer.domElement);
    }


    function animate() {
      requestAnimationFrame(animate);
      render();
    }


    function render() {
      renderer.render(scene, camera);
    }


    // Función para actualizar la geometría 3D a partir de los datos de Paper.js
    function removeWallGeometriesFromScene() {
      const objectsToRemove: THREE.Object3D[] = [];


      scene.traverse((object: any) => {
        if (object instanceof THREE.Mesh && object.name === "wallGeometry") {
          objectsToRemove.push(object);
        }
      });


      objectsToRemove.forEach((obj: any) => {
        scene.remove(obj);
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat: { dispose: () => any; }) => mat.dispose());
        } else {
          obj.material.dispose();
        }
      });


      console.log(
        `Se eliminaron ${objectsToRemove.length} geometrías con name="wallGeometry"`
      );
    }


    function updateGeometry() {
      //Cada pared dibujada en 2D
      if (pathsArray.length !== 0) {
        pathsArray.forEach((path) => {
          // Generar la geometría extruida para esta pared individual
          const extrudeGeometry = getExtrusionGeometryForPath(path, path.data.height2d);


          // Buscar si ya existe un mesh 3D para esta pared
          let existingMesh = walls3d.find(
            (mesh) => mesh.userData.pathId === path.id
          );


          if (existingMesh) {
            // Actualizar la geometría del mesh existente
            existingMesh.geometry.dispose();
            if (extrudeGeometry) existingMesh.geometry = extrudeGeometry;
          } else {
            // Crear un nuevo mesh para esta pared
            const material = new THREE.MeshBasicMaterial({
              color: 0xdddddd,
            });
            if (extrudeGeometry) {
              let newMesh = new THREE.Mesh(extrudeGeometry, material);
              newMesh.name = "wallGeometry";
              newMesh.userData.pathId = path.id; // Asociar el mesh a la pared 2D
              walls3d.push(newMesh);
              scene.add(newMesh);
            }
          }
        });
      } else {
        removeWallGeometriesFromScene();
      }
    }


    function getExtrusionGeometryForPath(path: paper.Path, thickness = 5) {
      let shape: THREE.Shape | null = null;
      const transferCoord = function (pos: paper.Point) {
        const width = window.innerWidth / 2;
        const height = window.innerHeight / 2;
        let newX = pos.x - width / 2;
        let newY = height - pos.y - height / 2;
        return new THREE.Vector2(newX / 10, newY / 10);
      };


      // Manejar CompoundPaths (formas con agujeros)
      if (path instanceof paper.CompoundPath && path.children) {
        /* path.children.forEach((child, index: number) => {
          const childShape = new THREE.Shape();
    
    
          child.segments.forEach((seg: any, i: number) => {
            let pt = transferCoord(seg.point);
            if (i === 0) {
              childShape.moveTo(pt.x, pt.y);
            } else {
              childShape.lineTo(pt.x, pt.y);
            }
          });
    
    
          if (index === 0) {
            // Primer child es la forma principal
            shape = childShape;
          } else {
            // Children subsiguientes son agujeros
            if (shape) {
              shape.holes.push(new THREE.Path(childShape.getPoints()));
            }
          }
        }); */
      } else if (path.segments) {
        // Path simple
        shape = new THREE.Shape();
        path.segments.forEach((seg: paper.Segment, i: number) => {
          let pt = transferCoord(seg.point);
          if (i === 0) {
            shape!.moveTo(pt.x, pt.y);
          } else {
            shape!.lineTo(pt.x, pt.y);
          }
        });
        shape.closePath();
      }


      if (!shape) return null;


      let geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: true,
      });


      return geometry;
    }


    // 1) Deseleccionar **únicamente** los paths que estén seleccionados
    function deselectAllPaths() {
      const selectedPaths = paper.project.getItems({
        class: paper.Path,
        selected: true
      }) as paper.Path[];

      selectedPaths.forEach(path => {
        path.selected = false;
      });
    }




    //loadScripts();
  }, []);


  return (
    <div className="cad-container">
      <div className="sidebar" id="menu">
        <h5>Tresnak</h5>
        <a href="#" id="drawBtn">Draw</a>
        <a href="#" id="eraseBtn">Erase</a>
        <a href="#" id="modifyBtn">Modify</a>
        <a id="openModalBtn">3D Canvas erakutsi</a>
        <button id="exportSvgBtn">Proiektua esportatu</button>
        <label htmlFor="fileInput">Proiektua kargatu</label>
        <input type="file" id="fileInput" accept=".json" />{/* ,image/svg+xml */}


      </div>
      <div className="canvas-container">
        <canvas id="myCanvas"></canvas>
      </div>
      <div id="popupModal" className="modal">
        <div className="modal-content" id="modal-content">
          <span id="close" className="close">&times;</span>
          {/* Aquí se mostrará el contenido de Three.js */}
          <div className="extrudedView" id="canvas3D"></div>
        </div>
      </div>
    </div>

  );
};
export default Workk;