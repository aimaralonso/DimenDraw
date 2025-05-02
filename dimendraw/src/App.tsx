import React, { useEffect } from 'react';
import './Graphic.css'


const Workk: React.FC = () => {
  useEffect(() => {
    const loadScript = (src: string, type?: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        if (type) {
          script.type = type;
        }
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Error al cargar el script: ${src}`));
        document.body.appendChild(script);
      });
    };


    const loadScripts = async () => {
      try {
        await loadScript('src/script.ts', 'module');
      } catch (error) {
        console.error(error);
      }
    };


    loadScripts();
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