let zIndex = 1000;
const openWindows = new Set();

function createIcon(name, emoji, x, y, appUrl) {
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.style.left = x + 'px';
    icon.style.top = y + 'px';
    icon.innerHTML = `
        <div class="icon-emoji">${emoji}</div>
        <div>${name}</div>`;
    icon.onclick = () => openWindow(name, appUrl);
    document.querySelector('.desktop').appendChild(icon);
    return icon;
}

function openWindow(name, url) {
    const window = document.createElement('div');
    window.className = 'window';
    window.style.width = '600px';
    window.style.height = '400px';
    
    // Center the window
    const desktopWidth = document.querySelector('.desktop').clientWidth;
    const desktopHeight = document.querySelector('.desktop').clientHeight;
    window.style.left = `${(desktopWidth - 600) / 2}px`;
    window.style.top = `${(desktopHeight - 400) / 2}px`;
    
    window.style.zIndex = ++zIndex;

    window.innerHTML = `
        <div class="window-header">
            <h3 class="window-title">${name}</h3>
            <div class="window-controls">
                <span class="minimize">-</span>
                <span class="maximize">□</span>
                <span class="close">×</span>
            </div>
        </div>
        <div class="window-content">
            <iframe src="${url}" sandbox="allow-scripts allow-same-origin" allow="geolocation; microphone; camera; accelerometer; gyroscope" allowfullscreen></iframe>
        </div>
    `;

    document.querySelector('.desktop').appendChild(window);
    makeDraggable(window);
    makeResizable(window);

    window.querySelector('.close').onclick = () => {
        document.querySelector('.desktop').removeChild(window);
        openWindows.delete(name);
        updateTaskbar();
    };

    window.querySelector('.maximize').onclick = () => {
        if (window.style.width === '100%') {
            window.style.width = '600px';
            window.style.height = '400px';
            window.style.left = `${(desktopWidth - 600) / 2}px`;
            window.style.top = `${(desktopHeight - 400) / 2}px`;
        } else {
            window.style.width = '100%';
            window.style.height = 'calc(100% - 30px)';
            window.style.left = '0';
            window.style.top = '0';
        }
    };

    window.addEventListener('mousedown', () => {
        window.style.zIndex = ++zIndex;
    });

    openWindows.add(name);
    updateTaskbar();
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.querySelector('.window-header').onmousedown = dragMouseDown;
    element.querySelector('.window-header').ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
        const touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementTouchDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function elementTouchDrag(e) {
        e.preventDefault();
        const touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
    }
}

function makeResizable(element) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.background = '#00BFFF';
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.bottom = 0;
    resizer.style.cursor = 'se-resize';
    element.appendChild(resizer);

    resizer.addEventListener('mousedown', initResize, false);
    resizer.addEventListener('touchstart', initResizeTouch, false);

    function initResize(e) {
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function initResizeTouch(e) {
        window.addEventListener('touchmove', resizeTouch, false);
        window.addEventListener('touchend', stopResize, false);
    }

    function resize(e) {
        element.style.width = (e.clientX - element.offsetLeft) + 'px';
        element.style.height = (e.clientY - element.offsetTop) + 'px';
    }

    function resizeTouch(e) {
        const touch = e.touches[0];
        element.style.width = (touch.clientX - element.offsetLeft) + 'px';
        element.style.height = (touch.clientY - element.offsetTop) + 'px';
    }

    function stopResize() {
        window.removeEventListener('mousemove', resize, false);
        window.removeEventListener('mouseup', stopResize, false);
        window.removeEventListener('touchmove', resizeTouch, false);
        window.removeEventListener('touchend', stopResize, false);
    }
}

function updateTaskbar() {
    const taskbar = document.querySelector('.taskbar');
    taskbar.innerHTML = '<button class="start-button">Start</button>';
    for (const windowName of openWindows) {
        const taskbarItem = document.createElement('button');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.textContent = windowName;
        taskbarItem.onclick = () => {
            const windowElement = Array.from(document.querySelectorAll('.window')).find(el => el.querySelector('.window-title').textContent === windowName);
            if (windowElement) {
                windowElement.style.zIndex = ++zIndex;
            }
        };
        taskbar.appendChild(taskbarItem);
    }

    const startButton = taskbar.querySelector('.start-button');
    startButton.onclick = toggleStartMenu;
}

function toggleStartMenu() {
    const startMenu = document.querySelector('.start-menu');
    startMenu.style.display = startMenu.style.display === 'none' ? 'block' : 'none';
}

function importBackgroundImage() {
    const input = document.getElementById('bg-input');
    input.click();
}

function handleBackgroundImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.desktop').style.backgroundImage = `url(${e.target.result})`;
            document.querySelector('.desktop').style.backgroundSize = 'cover';
            document.querySelector('.desktop').style.backgroundPosition = 'center';
        }
        reader.readAsDataURL(file);
    }
}

function openScreenSaver() {
    openWindow('Screen Saver', '#');
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    };
    const dateTimeString = now.toLocaleString('en-US', options);
    document.getElementById('datetime').textContent = dateTimeString;
}

window.onload = () => {
    const icons = [
        createIcon('CyberOS', '💻', 20, 20, '#'),
        createIcon('Audio Analysis', '🎵', 20, 130, '#'),
        createIcon('AI Prompt', '🤖', 20, 240, '#'),
        createIcon('Visual Spectrum', '🌈', 20, 350, '#'),
        createIcon('Motion Sensors', '📱', 20, 460, '#'),
        createIcon('GPT-4.0', '🧠', 20, 570, '#'),
        createIcon('CSS Emulator', '🎨', 120, 20, '#'),
        createIcon('C# Emulator', '⌨️', 120, 130, '#'),
        createIcon('JavaScript', '📜', 120, 240, '#'),
        createIcon('Synth Radio', '📻', 120, 350, '#'),
        createIcon('Search Engine', '🔍', 120, 460, '#'),
        createIcon('Acid Synth', '🎹', 120, 570, '#'),
        createIcon('AI Art Gallery', '🎨', 220, 20, '#'),
        createIcon('Roll20', '🎲', 220, 130, '#'),
        createIcon('D&D Beyond', '🐉', 220, 240, '#'),
        createIcon('AI Image Generator', '🖼️', 220, 350, '#'),
        createIcon('Duke Nukem 3D', '💣', 220, 460, '#'),
        createIcon('Doom', '👹', 220, 570, '#'),
        createIcon('Interdimensional Cable', '📺', 320, 20, '#')
    ];

    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    document.body.appendChild(taskbar);

    const startMenu = document.createElement('div');
    startMenu.className = 'start-menu';
    startMenu.innerHTML = `
        <a href="#" onclick="openWindow('CyberOS', '#')">CyberOS</a>
        <a href="#" onclick="openWindow('Audio Analysis', '#')">Audio Analysis</a>
        <a href="#" onclick="openWindow('AI Prompt', '#')">AI Prompt Engineering</a>
        <a href="#" onclick="openWindow('Visual Spectrum', '#')">Visual Spectrum Analysis</a>
        <a href="#" onclick="openWindow('Motion Sensors', '#')">Motion Sensors</a>
        <a href="#" onclick="openWindow('GPT-4.0', '#')">GPT-4.0 Offline Emulator</a>
        <a href="#" onclick="openWindow('CSS Emulator', '#')">CSS Emulator</a>
        <a href="#" onclick="openWindow('C# Emulator', '#')">C# Emulator</a>
        <a href="#" onclick="openWindow('JavaScript', '#')">JavaScript Emulator</a>
        <a href="#" onclick="openWindow('Synth Radio', '#')">Synth Radio</a>
        <a href="#" onclick="openWindow('Search Engine', '#')">Search Engine</a>
        <a href="#" onclick="openWindow('Acid Synth', '#')">Acid Synth</a>
        <a href="#" onclick="openWindow('AI Art Gallery', '#')">AI Art Gallery</a>
        <a href="#" onclick="openWindow('Roll20', '#')">Roll20</a>
        <a href="#" onclick="openWindow('D&D Beyond', '#')">D&D Beyond</a>
        <a href="#" onclick="openWindow('AI Image Generator', '#')">AI Image Generator</a>
        <a href="#" onclick="openWindow('Duke Nukem 3D', '#')">Duke Nukem 3D</a>
        <a href="#" onclick="openWindow('Doom', '#')">Doom</a>
        <a href="#" onclick="openWindow('Interdimensional Cable', '#')">Interdimensional Cable</a>
        <a href="#" onclick="openScreenSaver()">Screen Saver</a>
    `;
    startMenu.style.display = 'none';
    document.body.appendChild(startMenu);

    const importBgButton = document.createElement('button');
    importBgButton.className = 'import-bg-button';
    importBgButton.textContent = 'Import Background';
    importBgButton.onclick = importBackgroundImage;
    document.body.appendChild(importBgButton);

    const screenSaverButton = document.createElement('button');
    screenSaverButton.className = 'screen-saver-button';
    screenSaverButton.textContent = 'Screen Saver';
    screenSaverButton.onclick = openScreenSaver;
    document.body.appendChild(screenSaverButton);

    const bgInput = document.createElement('input');
    bgInput.type = 'file';
    bgInput.id = 'bg-input';
    bgInput.accept = 'image/*';
    bgInput.onchange = handleBackgroundImage;
    document.body.appendChild(bgInput);

    const datetimeElement = document.createElement('div');
    datetimeElement.id = 'datetime';
    datetimeElement.className = 'datetime';
    document.body.appendChild(datetimeElement);

    updateTaskbar();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Auto open CyberOS terminal page when loading
    openWindow('CyberOS', '#');
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-button') && !e.target.closest('.start-menu')) {
        document.querySelector('.start-menu').style.display = 'none';
    }
});