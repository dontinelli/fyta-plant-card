const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "device_id", required: true, selector: { device: { integration: 'fyta' } } },
  {
    name: "display_mode",
    selector: {
      select: {
        options: [
          { label: "Full", value: "full" },
          { label: "Compact", value: "compact" }
        ],
        mode: "dropdown"
      }
    },
    default: "full"
  },
  {
    type: "grid",
    schema: [
      { 
        name: "show_light", 
        selector: { boolean: {} }, 
        required: false,
      },
      {
        name: "light_order",
        selector: {
          select: {
            options: [
              { label: "Order 1 (First)", value: "1" },
              { label: "Order 2", value: "2" },
              { label: "Order 3", value: "3" },
              { label: "Order 4", value: "4" },
              { label: "Order 5 (Last)", value: "5" }
            ],
            mode: "dropdown"
          }
        },
        default: "1"
      }
    ]
  },
  {
    type: "grid",
    schema: [
      { 
        name: "show_moisture", 
        selector: { boolean: {} }, 
        required: false,
      },
      {
        name: "moisture_order",
        selector: {
          select: {
            options: [
              { label: "Order 1 (First)", value: "1" },
              { label: "Order 2", value: "2" },
              { label: "Order 3", value: "3" },
              { label: "Order 4", value: "4" },
              { label: "Order 5 (Last)", value: "5" }
            ],
            mode: "dropdown"
          }
        },
        default: "2"
      }
    ]
  },
  {
    type: "grid",
    schema: [
      { 
        name: "show_temperature", 
        selector: { boolean: {} }, 
        required: false,
      },
      {
        name: "temperature_order",
        selector: {
          select: {
            options: [
              { label: "Order 1 (First)", value: "1" },
              { label: "Order 2", value: "2" },
              { label: "Order 3", value: "3" },
              { label: "Order 4", value: "4" },
              { label: "Order 5 (Last)", value: "5" }
            ],
            mode: "dropdown"
          }
        },
        default: "3"
      }
    ]
  },
  {
    type: "grid",
    schema: [
      { 
        name: "show_salinity", 
        selector: { boolean: {} }, 
        required: false,
      },
      {
        name: "salinity_order",
        selector: {
          select: {
            options: [
              { label: "Order 1 (First)", value: "1" },
              { label: "Order 2", value: "2" },
              { label: "Order 3", value: "3" },
              { label: "Order 4", value: "4" },
              { label: "Order 5 (Last)", value: "5" }
            ],
            mode: "dropdown"
          }
        },
        default: "4"
      }
    ]
  },
  {
    type: "grid",
    schema: [
      { 
        name: "show_nutrition", 
        selector: { boolean: {} }, 
        required: false,
      },
      {
        name: "nutrition_order",
        selector: {
          select: {
            options: [
              { label: "Order 1 (First)", value: "1" },
              { label: "Order 2", value: "2" },
              { label: "Order 3", value: "3" },
              { label: "Order 4", value: "4" },
              { label: "Order 5 (Last)", value: "5" }
            ],
            mode: "dropdown"
          }
        },
        default: "5"
      }
    ]
  },
  {
    type: "info",
    name: "",
    label: "Display Order Info",
    description: "The sensor with the highest order number will appear full-width at the bottom when you have an odd number of visible sensors."
  }
];

class FytaPlantCard extends HTMLElement {
  static version = '1.0.0';

  static getConfigElement() {
    return document.createElement("fyta-plant-card-editor");
  }

  static getStubConfig() {
    return { 
      device_id: "", 
      title: "",
      display_mode: "full",
      show_light: true,
      light_order: "1",
      show_moisture: true,
      moisture_order: "2",
      show_temperature: true,
      temperature_order: "3",
      show_salinity: true,
      salinity_order: "4",
      show_nutrition: true,
      nutrition_order: "5"
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._initialized = false;
    this._plant_image = "";
    this._sensor_entities = {
      battery_entity: "", 
      light_entity: "", 
      moisture_entity: "", 
      salinity_entity: "", 
      temperature_entity: "",
      ec_entity: ""
    };
    
    this._status_entities = { 
      plant_status: "", 
      light_status: "", 
      moisture_status: "", 
      salinity_status: "", 
      nutrients_status: "", 
      temperature_status: "" 
    };
    
    // Improved color scheme for plant status
    this._plantStatusColor = { 
      deleted: "var(--text-color, white)", 
      doing_great: "var(--success-color, #4CAF50)", 
      need_attention: "var(--warning-color, #FFC107)", 
      no_sensor: "var(--disabled-text-color, gray)" 
    };
    
    // Improved color scheme for measurement status
    this._measurementStatusColor = {
      no_data: "var(--disabled-text-color, gray)",
      too_low: "var(--error-color, #F44336)", 
      low: "var(--warning-color, #FFC107)", 
      perfect: "var(--success-color, #4CAF50)", 
      high: "var(--warning-color, #FFC107)", 
      too_high: "var(--error-color, #F44336)"
    };

    // Icons for different sensor types
    this._icons = {
      battery_entity: "mdi:battery",
      light_entity: "mdi:white-balance-sunny",
      moisture_entity: "mdi:water",
      temperature_entity: "mdi:thermometer",
      salinity_entity: "mdi:water-percent", 
      nutrition: "mdi:emoticon-poop"
    };
  }

  _click(entity) {
    if (!entity) return;
    const event = new Event("hass-more-info", {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detail = { entityId: entity };
    this.dispatchEvent(event);
    return event;
  }

  _getStateColor(key, hass) {
    if (key === 'battery_entity') {
      const entity = this._sensor_entities.battery_entity;
      if (!entity) return "var(--disabled-text-color, gray)";
      
      const state = parseInt(hass.states[entity].state);
      if (state <= 10) {
        return "var(--error-color, #F44336)";
      } else if (state <= 20) {
        return "var(--warning-color, #FFC107)";
      }
      return "var(--success-color, #4CAF50)";
    } else if (key === 'light_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.light_status]?.state || "no_data"];
    } else if (key === 'moisture_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.moisture_status]?.state || "no_data"];
    } else if (key === 'salinity_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.nutrients_status]?.state || "no_data"];
    } else if (key === 'ec_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.nutrients_status]?.state || "no_data"];
    } else if (key === 'temperature_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.temperature_status]?.state || "no_data"];
    } else if (key === 'plant') {
      return this._plantStatusColor[hass.states[this._status_entities.plant_status]?.state || "no_sensor"];
    }
    
    return "var(--primary-text-color, white)";
  }

  getCardSize() {
    // Return different sizes based on display mode and number of sensors shown
    if (this.config?.display_mode === "compact") {
      return 3;
    }
    
    let size = 4; // Base size
    
    // Count enabled sensors
    let sensorCount = 0;
    if (this.config?.show_light) sensorCount++;
    if (this.config?.show_moisture) sensorCount++;
    if (this.config?.show_temperature) sensorCount++;
    if (this.config?.show_salinity) sensorCount++;
    if (this.config?.show_nutrition) sensorCount++;
    
    // Add 0.5 for each sensor beyond the first 2
    if (sensorCount > 2) {
      size += (sensorCount - 2) * 0.5;
    }
    
    return size;
  }

  getLayoutOptions() {
    return {
      grid_rows: 3,
      grid_columns: 4,
      grid_min_rows: 3,
      grid_min_columns: 2,
    };
  }

  set hass(hass) {
    if (!this.config) {
      return html``;
    }
    if (!this.config.device_id) {
      return html`<hui-warning>No device specified</hui-warning>`;
    }
    if (!this._initialized) {
      this.updateEntities(this.config.device_id, hass)
    }

    // On subsequent updates, we only need to update the display values and colors
    if (this._initialized) {
      this._updateDisplayValues(hass);
    }
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }

    const oldDevice = this?.config?.device_id;
    
    // Create a completely new config object with all defaults set
    const newConfig = {
      device_id: "",
      title: "",
      display_mode: "full",
      show_light: true,
      light_order: "1",
      show_moisture: true,
      moisture_order: "2",
      show_temperature: true,
      temperature_order: "3",
      show_salinity: true,
      salinity_order: "4",
      show_nutrition: true,
      nutrition_order: "5"
    };
    
    // Then copy values from provided config
    if (config) {
      Object.keys(config).forEach(key => {
        if (config[key] !== undefined && 
            key !== 'show_fertilize_days' && 
            key !== 'display_options' &&
            key !== 'show_ec' &&
            key !== 'sensor_order' &&
            !key.includes('_priority') &&
            !key.includes('_position')) {
          newConfig[key] = config[key];
        }
      });
    }
    
    // Handle legacy config with show_fertilize_days
    if (config && config.show_fertilize_days !== undefined) {
      // If show_fertilize_days was explicitly set to false but show_nutrition wasn't,
      // respect the fertilize days setting by disabling nutrition too
      if (config.show_fertilize_days === false && config.show_nutrition === undefined) {
        newConfig.show_nutrition = false;
      }
    }
    
    // Handle legacy config with sensor_order
    if (config && config.sensor_order && config.sensor_order !== 'default') {
      // Map from old-style ordering to new order values
      const orderMap = {
        'l': 'light',
        'm': 'moisture',
        't': 'temperature',
        's': 'salinity',
        'n': 'nutrition'
      };
      
      const order = config.sensor_order.split('');
      order.forEach((letter, index) => {
        if (orderMap[letter]) {
          const sensorType = orderMap[letter];
          newConfig[`${sensorType}_order`] = String(index + 1);
        }
      });
    }
    
    // Handle legacy config with priority or position values
    const sensorTypes = ['light', 'moisture', 'temperature', 'salinity', 'nutrition'];
    sensorTypes.forEach(type => {
      const priorityKey = `${type}_priority`;
      const positionKey = `${type}_position`;
      const orderKey = `${type}_order`;
      if (config[priorityKey] !== undefined) {
        newConfig[orderKey] = String(config[priorityKey]);
      } else if (config[positionKey] !== undefined) {
        newConfig[orderKey] = String(config[positionKey]);
      }
    });
    
    // Ensure at least one option is selected
    const hasSelection = 
      newConfig.show_light || 
      newConfig.show_moisture || 
      newConfig.show_temperature || 
      newConfig.show_salinity ||
      newConfig.show_nutrition;
    
    if (!hasSelection) {
      // Default to showing all if nothing selected
      newConfig.show_light = true;
      newConfig.show_moisture = true;
      newConfig.show_temperature = true;
      newConfig.show_salinity = true;
      newConfig.show_nutrition = true;
    }
    
    this.config = newConfig;

    if (!this.config.device_id) {
      throw new Error("You need to define a device");
    }

    if (this.config.device_id != oldDevice) {
      this._initialized = false;
    }
  }

  updateEntities(device_id, hass) {
    if (!hass) {
      console.debug(`hass not set.`);
      return;
    }
    if (!device_id) {
      console.debug(`device_id not set.`);
      return;
    }

    const device = hass.devices[device_id];
    let device_name = device.name;

    if (!this.config?.title || this.config.title === "") {
      // Create a new config object with all defaults
      const newConfig = {
        device_id: this.config.device_id || "",
        title: device_name,
        display_mode: this.config.display_mode || "full",
        show_light: this.config.show_light !== undefined ? this.config.show_light : true,
        light_order: this.config.light_order || "1",
        show_moisture: this.config.show_moisture !== undefined ? this.config.show_moisture : true,
        moisture_order: this.config.moisture_order || "2",
        show_temperature: this.config.show_temperature !== undefined ? this.config.show_temperature : true,
        temperature_order: this.config.temperature_order || "3",
        show_salinity: this.config.show_salinity !== undefined ? this.config.show_salinity : true,
        salinity_order: this.config.salinity_order || "4",
        show_nutrition: this.config.show_nutrition !== undefined ? this.config.show_nutrition : true
      };
      
      this.config = newConfig;
    }

    device_name = device_name.toLowerCase();

    const device_entities = Object.keys(hass.entities).filter(id => hass.entities[id].device_id === device_id)

    device_entities.forEach(id => this.getEntityId(id, hass), this);

    const root = this.shadowRoot;
    if (root.lastChild) {
      root.removeChild(root.lastChild);
    }

    const card = document.createElement("ha-card");
    const content = document.createElement("div");
    const style = document.createElement("style");

    style.textContent = `
      ha-card {
        position: relative;
        padding: 0;
        background-size: 100%;
        margin-top: 25px;
      }

      img {
        display: block;
        height: auto;
        transition: filter .2s linear;
        width: 100%;
      }

      .header {
        padding-top: 4px;
        height: 65px;
        position: relative;
      }

      .image-container {
        position: relative;
        width: 88px;
        height: 88px;
        margin-left: 16px;
        margin-right: 16px;
        margin-top: -28px;
        float: left;
        z-index: 1;
      }

      .battery-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        cursor: pointer;
        z-index: 2;
        pointer-events: all;
      }

      .battery-container .tip {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        padding: 6px 10px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: rgba(30, 30, 30, 0.9);
        color: white;
        white-space: nowrap;
        z-index: 5;
        border-radius: 4px;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s 0.2s;
        font-size: 14px;
        pointer-events: none;
      }

      .battery-container:hover .tip {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, -50%) scale(1);
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s 0s;
      }

      .battery-circle {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        z-index: 2;
      }

      .battery-circle circle {
        stroke-width: 4px;
        stroke: var(--disabled-text-color, #888);
        stroke-linecap: round;
        fill: transparent;
        transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease;
      }

      .header > img, .image-container img {
        border-radius: 50%;
        width: 88px;
        height: 88px;
        object-fit: cover;
        position: relative;
        z-index: 1;
        box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
        cursor: pointer;
      }

      .header > #name {
        font-weight: bold;
        width: calc(100% - 120px);
        margin-top: 8px;
        margin-left: 116px;
        text-transform: capitalize;
        display: block;
        cursor: pointer;
      }

      .header > #species {
        text-transform: capitalize;
        color: #8c96a5;
        display: block;
        cursor: pointer;
        margin-left: 116px;
      }

      #battery {
        position: absolute;
        right: 16px;
        top: 16px;
        font-size: 14px;
        font-weight: bold;
      }

      .attributes {
        display: flex;
        flex-wrap: wrap;
        white-space: nowrap;
        padding: 4px 16px 8px;
      }

      .attribute {
        white-space: nowrap;
        display: flex;  
        align-items: center;
        width: 100%;
        margin-bottom: 8px;
        cursor: pointer;
      }

      .attribute ha-icon {
        margin-right: 8px;
        flex-shrink: 0;
        width: 24px;
        text-align: center;
      }

      .sensor-value {
        flex-shrink: 0;
        margin-right: 4px;
        text-align: right;
        min-width: 40px;
      }

      .meter {
        height: 8px;
        background-color: var(--primary-background-color);
        border-radius: 2px;
        margin-right: 8px;
        display: inline-grid;
        overflow: hidden;
        flex-grow: 1;
        max-width: none;
      }

      .meter > span {
        grid-row: 1;
        grid-column: 1;
        height: 100%;
      }

      .meter > .good {
        background-color: rgba(43,194,83,1);
      }

      .meter > .bad {
        background-color: rgba(240,163,163);
      }

      .meter > .warning {
        background-color: rgba(255,193,7,1);
      }

      .meter > .unavailable {
        background-color: rgba(158,158,158,1);
      }

      .divider {
        height: 1px;
        background-color: #727272;
        opacity: 0.25;
        margin-left: 8px;
        margin-right: 8px;
      }

      .tooltip {
        position: relative;
      }

      .tooltip .tip {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        padding: 6px 10px;
        top: 3.3em;
        left: 50%;
        -webkit-transform: translateX(-50%) translateY(-180%);
        transform: translateX(-50%) translateY(-180%);
        background: grey;
        color: white;
        white-space: nowrap;
        z-index: 2;
        border-radius: 2px;
        transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1), transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
      }

      .battery.tooltip .tip {
        top: 2em;
      }

      .tooltip:hover .tip, .tooltip:active .tip {
        display: block;
        opacity: 1;
        visibility: visible;
        -webkit-transform: translateX(-50%) translateY(-200%);
        transform: translateX(-50%) translateY(-200%);
      }

      .uom {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        flex-shrink: 0;
        text-align: left;
        width: 30px;
        margin-right: 4px;
      }

      .sensor-row {
        display: flex;
        width: 100%;
        justify-content: space-between;
      }
      
      .sensor-column {
        width: 50%;
        padding-right: 12px;
        box-sizing: border-box;
      }
      
      .compact-mode .attribute {
        margin-bottom: 4px;
      }

      .compact-mode .meter {
        max-width: none;
      }

      .compact-mode .sensor-value,
      .compact-mode .uom {
        display: none;
      }
      
      .compact-mode #species {
        display: none;
      }
      
      .compact-mode #battery {
        top: 5px;
      }
      
      .compact-mode #name {
        max-width: 60%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;

    content.id = "container";
    content.className = this.config.display_mode === "compact" ? "compact-mode" : "";
    
    content.innerHTML = `
      <div class="header">
        <div class="image-container">
          <img src="${this._plant_image}" @click="${this._click.bind(this, this._status_entities.plant_status)}">
          <div class="battery-container" @click="${this._click.bind(this, this._sensor_entities.battery_entity)}">
            <div class="tip" id="battery-tooltip"></div>
            <svg class="battery-circle" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" id="battery-indicator" stroke-width="4" stroke-dasharray="276.46" stroke-dashoffset="0"></circle>
            </svg>
          </div>
        </div>
        <span id="name" style="color:${this._getStateColor("plant", hass)};" @click="${this._click.bind(this, this._status_entities.plant_status)}">${this.config.title}</span>
        <span id="species" @click="${this._click.bind(this, this._status_entities.plant_status)}">${hass.states[this._status_entities.plant_status].attributes.friendly_name || ""}</span>
      </div>
      <div class="divider"></div>
      <div class="attributes">
        ${this._renderSensors(hass)}
      </div>
    `;
    card.appendChild(content);
    card.appendChild(style);
    root.appendChild(card);

    // Set up event delegation for click handlers
    card.addEventListener('click', (e) => {
      // Find the closest clickable element
      const clickableElement = e.target.closest('[data-entity], img, #name, #species, .battery, .attribute');
      if (clickableElement) {
        const entityId = clickableElement.dataset.entity || this._status_entities.plant_status;
        if (entityId) {
          this._click(entityId);
          e.stopPropagation();
        }
      }
    });

    // Call _renderBattery explicitly after the DOM is created
    setTimeout(() => {
      if (this._sensor_entities.battery_entity) {
        this._renderBattery(hass);
      }
    }, 100);

    this._initialized = true;
  }

  _renderBattery(hass) {
    if (this._sensor_entities.battery_entity === "") {
      return "";
    }

    const entity = this._sensor_entities.battery_entity;
    if (!hass.states[entity]) {
      return "";
    }
    
    const state = parseInt(hass.states[entity].state);
    
    // Set color based on battery level
    let color = "var(--success-color, #4CAF50)"; // Green for good levels
    let statusText = "Good";
    
    if (state <= 10) {
      color = "var(--error-color, #F44336)"; // Red for critical
      statusText = "Critical";
    } else if (state <= 20) {
      color = "var(--error-color, #F44336)"; // Red for very low
      statusText = "Very Low";
    } else if (state <= 30) {
      color = "var(--warning-color, #FFC107)"; // Yellow/orange for low
      statusText = "Low";
    } else if (state <= 50) {
      color = "var(--success-color, #4CAF50)"; // Green for medium
      statusText = "Medium";
    } else {
      color = "var(--success-color, #4CAF50)"; // Green for high
      statusText = "Good";
    }
    
    // Calculate the circle properties
    const radius = 44;
    const circumference = 2 * Math.PI * radius; // 2πr where r=44 from the SVG circle
    const offset = circumference - (state / 100) * circumference;
    
    // Get the elements
    const circle = this.shadowRoot.querySelector('#battery-indicator');
    const tooltip = this.shadowRoot.querySelector('#battery-tooltip');
    
    // Update the circle properties and tooltip immediately
    if (circle) {
      // Apply the color and offset as inline styles and attributes for better browser compatibility
      circle.style.stroke = color;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
      circle.setAttribute('stroke', color);
    }
    
    if (tooltip) {
      tooltip.innerHTML = `Battery: ${state}%<br>Status: ${statusText}`;
    }
    
    return "";
  }

  _renderSensors(hass) {
    // Main sensor parameters - combine EC and salinity since EC is not separately configured
    const sensorKeys = ['light_entity', 'moisture_entity', 'temperature_entity', 'salinity_entity', 'ec_entity'];
    const allSensors = [];
    
    // Filter sensors based on configuration
    const visibleSensors = sensorKeys.filter(key => {
      // EC always shares the same setting as salinity
      if (key === 'ec_entity') {
        return this.config.show_salinity;
      }
      
      // Translate from entity key to config key
      const configKey = key === 'light_entity' ? 'show_light' :
                       key === 'moisture_entity' ? 'show_moisture' :
                       key === 'temperature_entity' ? 'show_temperature' :
                       key === 'salinity_entity' ? 'show_salinity' : null;
                        
      return configKey && this.config[configKey];
    });
    
    // Add visible sensors to our collection
    visibleSensors.forEach(key => {
      if (this._sensor_entities[key] !== "") {
        let sensorType = key === 'light_entity' ? 'light' :
                        key === 'moisture_entity' ? 'moisture' :
                        key === 'temperature_entity' ? 'temperature' :
                        (key === 'salinity_entity' || key === 'ec_entity') ? 'salinity' : null;
                        
        const order = parseInt(this.config[`${sensorType}_order`] || "999");
                        
        allSensors.push({
          type: 'sensor',
          key: key,
          sensorType: sensorType,
          order: order
        });
      }
    });
    
    // Add nutrition if configured
    if (this.config.show_nutrition && this._status_entities.nutrients_status) {
      allSensors.push({
        type: 'sensor',
        key: 'nutrition',
        sensorType: 'nutrition',
        order: parseInt(this.config.nutrition_order || "5")
      });
    }
    
    // Sort sensors based on order
    allSensors.sort((a, b) => {
      // Primary sort by order
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      // Secondary sort by type name (for stable sorting when orders are equal)
      return a.sensorType.localeCompare(b.sensorType);
    });
    
    // Distribute items into columns considering their total number
    const leftColumnItems = [];
    const rightColumnItems = [];
    
    if (allSensors.length % 2 === 0) {
      // Even number of sensors - distribute evenly
      allSensors.forEach((sensor, index) => {
        if (index % 2 === 0) {
          leftColumnItems.push(sensor);
        } else {
          rightColumnItems.push(sensor);
        }
      });
    } else {
      // Odd number of sensors - always make the last item full-width
      // Get all except the last item
      const regularSensors = allSensors.slice(0, allSensors.length - 1);
      const lastSensor = allSensors[allSensors.length - 1];
      
      // Distribute regular sensors
      regularSensors.forEach((sensor, index) => {
        if (index % 2 === 0) {
          leftColumnItems.push(sensor);
        } else {
          rightColumnItems.push(sensor);
        }
      });
      
      // Mark the last item for full-width display
      leftColumnItems.push({ type: 'full-width-placeholder' });
      // Store the sensor that should be displayed full-width
      this._fullWidthSensor = lastSensor;
    }
    
    // Render a single sensor
    const renderSensor = (item) => {
      if (item.type === 'full-width-placeholder') {
        // This is just a placeholder to mark where the full-width item will go
        return '';
      }
      
      if (item.key === 'nutrition') {
        return renderNutrition();
      }
      
      const key = item.key;
      const entity = this._sensor_entities[key];
      const state = hass.states[entity].state;
      
      // Get correct unit of measurement
      let uom = hass.states[entity].attributes.unit_of_measurement || "";
      // Special case for light to fix unit display
      if (key === 'light_entity' && uom === 'μmol/s⋅m²') {
        uom = 'μmol/h';
      }
      
      // Get the proper status entity
      let statusEntity;
      let statusState = "";
      
      if (key === 'salinity_entity' || key === 'ec_entity') {
        statusEntity = this._status_entities.nutrients_status;
        if (statusEntity) {
          statusState = hass.states[statusEntity].state;
        }
      } else {
        statusEntity = this._status_entities[key.replace("_entity", "_status")];
        if (statusEntity) {
          statusState = hass.states[statusEntity].state;
        }
      }
      
      const color = this._getStateColor(key, hass);
      
      // Calculate meter width and class based on status
      let meterPercentage = 50; // Default to mid-range if no status
      let meterClass = "unavailable";
      
      if (statusState) {
        if (statusState === "too_low") {
          meterPercentage = 10;
          meterClass = "bad";
        } else if (statusState === "low") {
          meterPercentage = 30;
          meterClass = "warning";
        } else if (statusState === "perfect") {
          meterPercentage = 50;
          meterClass = "good";
        } else if (statusState === "high") {
          meterPercentage = 70;
          meterClass = "warning";
        } else if (statusState === "too_high") {
          meterPercentage = 90;
          meterClass = "bad";
        }
      }
      
      // Simplified tooltip content with current value and status
      const tooltipContent = statusEntity ? 
        `${key.replace("_entity", "")}: ${state} ${uom}<br>Status: ${statusState.replace(/_/g, " ")}` :
        `${key.replace("_entity", "")}: ${state} ${uom}`;
      
      // Icon based on sensor type - for EC, use a flash icon
      let icon;
      if (key === 'ec_entity') {
        icon = 'mdi:flash';
      } else {
        icon = this._icons[key];
      }
      
      return `
        <div class="attribute tooltip" @click="${this._click.bind(this, entity)}" data-entity="${entity}">
          <div class="tip" style="text-align:center;">${tooltipContent}</div>
          <ha-icon icon="${icon}" style="color:${color};"></ha-icon>
          <div class="meter">
            <span class="${meterClass}" style="width: ${meterPercentage}%;"></span>
          </div>
          <div class="sensor-value">${state}</div>
          <div class="uom">${uom}</div>
        </div>
      `;
    };
    
    // Render nutrition status
    const renderNutrition = () => {
      const statusEntity = this._status_entities.nutrients_status;
      const statusState = hass.states[statusEntity].state;
      const color = this._measurementStatusColor[statusState || "no_data"];
      
      let meterPercentage = 50;
      let meterClass = "unavailable";
      
      if (statusState) {
        if (statusState === "too_low") {
          meterPercentage = 10;
          meterClass = "bad";
        } else if (statusState === "low") {
          meterPercentage = 30;
          meterClass = "warning";
        } else if (statusState === "perfect") {
          meterPercentage = 50;
          meterClass = "good";
        } else if (statusState === "high") {
          meterPercentage = 70;
          meterClass = "warning";
        } else if (statusState === "too_high") {
          meterPercentage = 90;
          meterClass = "bad";
        }
      }
      
      // Always show empty value for nutrition
      const tooltipContent = `Nutrition Status: ${statusState.replace(/_/g, " ")}`;
      
      return `
        <div class="attribute tooltip" @click="${this._click.bind(this, statusEntity)}" data-entity="${statusEntity}">
          <div class="tip" style="text-align:center;">${tooltipContent}</div>
          <ha-icon icon="${this._icons.nutrition}" style="color:${color};"></ha-icon>
          <div class="meter">
            <span class="${meterClass}" style="width: ${meterPercentage}%;"></span>
          </div>
          <div class="sensor-value"></div>
          <div class="uom"></div>
        </div>
      `;
    };
    
    // Create HTML for both columns
    let leftColumnHtml = leftColumnItems.map(renderSensor).join('');
    let rightColumnHtml = rightColumnItems.map(renderSensor).join('');
    
    // Check if we need a full-width row
    const needsFullWidthItem = leftColumnItems.some(item => item.type === 'full-width-placeholder');
    
    let fullWidthItemHtml = "";
    if (needsFullWidthItem && this._fullWidthSensor) {
      if (this._fullWidthSensor.key === 'nutrition') {
        fullWidthItemHtml = renderNutrition();
      } else {
        fullWidthItemHtml = renderSensor(this._fullWidthSensor);
      }
    }
    
    // Construct final HTML
    let sensorHtml = `
      <div class="sensor-row">
        <div class="sensor-column">
          ${leftColumnHtml}
        </div>
        <div class="sensor-column">
          ${rightColumnHtml}
        </div>
      </div>
    `;
    
    // Add full-width item if needed
    if (fullWidthItemHtml) {
      sensorHtml += fullWidthItemHtml;
    }
    
    return sensorHtml;
  }

  getEntityId(id, hass) {
    if (hass.states[id].attributes.device_class == 'battery' && id.startsWith('sensor.')) {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.battery_entity = entityId;
    } else if (hass.states[id].attributes.device_class == 'moisture') {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.moisture_entity = entityId;
    } else if (hass.states[id].attributes.device_class == 'conductivity') {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.salinity_entity = entityId;
    } else if (hass.states[id].attributes.device_class == 'temperature') {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.temperature_entity = entityId;
    } else if (hass.states[id].attributes.unit_of_measurement == 'μmol/s⋅m²') {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.light_entity = entityId;
    } else if (hass.states[id].attributes.unit_of_measurement == 'mS/cm') {
      const entityId = hass.states[id].entity_id;
      this._sensor_entities.ec_entity = entityId;
    } else if (id.startsWith('image.')) {
      this._plant_image = hass.states[id].attributes.entity_picture;
    } else if (hass.states[id].attributes.device_class == 'enum') {
      if (hass.entities[id].translation_key === 'plant_status') {
        this._status_entities.plant_status = hass.states[id].entity_id;
      } else if (hass.entities[id].translation_key === 'light_status') {
        this._status_entities.light_status = hass.states[id].entity_id;
      } else if (hass.entities[id].translation_key === 'moisture_status') {
        this._status_entities.moisture_status = hass.states[id].entity_id;
      } else if (hass.entities[id].translation_key === 'salinity_status') {
        this._status_entities.salinity_status = hass.states[id].entity_id;
      } else if (hass.entities[id].translation_key === 'nutrients_status') {
        this._status_entities.nutrients_status = hass.states[id].entity_id;
      } else if (hass.entities[id].translation_key === 'temperature_status') {
        this._status_entities.temperature_status = hass.states[id].entity_id;
      }
    }
  }

  _updateDisplayValues(hass) {
    // Update plant status and title
    const nameElement = this.shadowRoot.querySelector('#name');
    if (nameElement) {
      nameElement.style.color = this._getStateColor("plant", hass);
    }
    
    // Update battery circle
    if (this._sensor_entities.battery_entity !== "") {
      this._renderBattery(hass);
    }
    
    // Update sensor values - include all sensor types
    const sensorKeys = ['light_entity', 'moisture_entity', 'temperature_entity', 'salinity_entity', 'ec_entity'];
    
    sensorKeys.forEach(key => {
      if (this._sensor_entities[key] !== "") {
        const entity = this._sensor_entities[key];
        const sensorElement = this.shadowRoot.querySelector(`.attribute[data-entity="${entity}"]`);
        
        if (sensorElement) {
          const state = hass.states[entity].state;
          const iconElement = sensorElement.querySelector('ha-icon');
          const valueElement = sensorElement.querySelector('.sensor-value');
          const meterElement = sensorElement.querySelector('.meter span');
          
          if (iconElement) {
            iconElement.style.color = this._getStateColor(key, hass);
          }
          
          if (valueElement) {
            valueElement.textContent = state;
          }
          
          if (meterElement) {
            // Get the proper status entity
            let statusEntity;
            let statusState = "";
            
            if (key === 'salinity_entity' || key === 'ec_entity') {
              statusEntity = this._status_entities.nutrients_status;
              if (statusEntity) {
                statusState = hass.states[statusEntity].state;
              }
            } else {
              statusEntity = this._status_entities[key.replace("_entity", "_status")];
              if (statusEntity) {
                statusState = hass.states[statusEntity].state;
              }
            }
            
            // Calculate meter width and class based on status
            let meterPercentage = 50; // Default to mid-range if no status
            let meterClass = "unavailable";
            
            if (statusState) {
              if (statusState === "too_low") {
                meterPercentage = 10;
                meterClass = "bad";
              } else if (statusState === "low") {
                meterPercentage = 30;
                meterClass = "warning";
              } else if (statusState === "perfect") {
                meterPercentage = 50;
                meterClass = "good";
              } else if (statusState === "high") {
                meterPercentage = 70;
                meterClass = "warning";
              } else if (statusState === "too_high") {
                meterPercentage = 90;
                meterClass = "bad";
              }
            }
            
            meterElement.className = meterClass;
            meterElement.style.width = `${meterPercentage}%`;
            
            // Update tooltip with current values
            const tooltipElement = sensorElement.querySelector('.tip');
            if (tooltipElement) {
              const uom = hass.states[entity].attributes.unit_of_measurement || "";
              
              // Simplified tooltip content
              const tooltipContent = statusEntity ? 
                `${key.replace("_entity", "")}: ${state} ${uom}<br>Status: ${statusState.replace(/_/g, " ")}` :
                `${key.replace("_entity", "")}: ${state} ${uom}`;
              
              tooltipElement.innerHTML = tooltipContent;
            }
          }
        }
      }
    });
    
    // Also update nutrition
    if (this._status_entities.nutrients_status) {
      // Find the nutrition element
      const nutritionElement = this.shadowRoot.querySelector(`.attribute[data-entity="${this._status_entities.nutrients_status}"]`);
      
      if (nutritionElement) {
        const statusEntity = this._status_entities.nutrients_status;
        const statusState = hass.states[statusEntity].state;
        const iconElement = nutritionElement.querySelector('ha-icon');
        const meterElement = nutritionElement.querySelector('.meter span');
        
        if (iconElement) {
          iconElement.style.color = this._measurementStatusColor[statusState || "no_data"];
        }
        
        if (meterElement) {
          // Calculate meter width and class based on status
          let meterPercentage = 50; // Default to mid-range if no status
          let meterClass = "unavailable";
          
          if (statusState) {
            if (statusState === "too_low") {
              meterPercentage = 10;
              meterClass = "bad";
            } else if (statusState === "low") {
              meterPercentage = 30;
              meterClass = "warning";
            } else if (statusState === "perfect") {
              meterPercentage = 50;
              meterClass = "good";
            } else if (statusState === "high") {
              meterPercentage = 70;
              meterClass = "warning";
            } else if (statusState === "too_high") {
              meterPercentage = 90;
              meterClass = "bad";
            }
          }
          
          meterElement.className = meterClass;
          meterElement.style.width = `${meterPercentage}%`;
        }
        
        // Update tooltip with current values
        const tooltipElement = nutritionElement.querySelector('.tip');
        if (tooltipElement) {
          // Build tooltip
          const tooltipContent = `Nutrition Status: ${statusState.replace(/_/g, " ")}`;
          tooltipElement.innerHTML = tooltipContent;
        }
      }
    }
  }
}

customElements.define("fyta-plant-card", FytaPlantCard);


function deepClone(value) {
  if (!(!!value && typeof value === "object")) {
    return value;
  }
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var result = {};
  Object.keys(value).forEach(
    function(key) { result[String(key)] = deepClone(value[String(key)]); });
  return result;
}

export class FytaPlantCardEditor extends LitElement {

  static properties = {
    hass: { type: Object },
    config: { state: true }
  };

  get _device_id() {
    return this.config?.device_id || '';
  }

  _computeLabel(schema) {
    if (schema.name == 'device_id') return 'Device (Required)';
    if (schema.name == 'title') return 'Title (Optional)';
    if (schema.name == 'display_mode') return 'Display Mode';
    if (schema.name == 'show_light') return 'Show Light Status';
    if (schema.name == 'light_order') return 'Light Order';
    if (schema.name == 'show_moisture') return 'Show Moisture Status';
    if (schema.name == 'moisture_order') return 'Moisture Order';
    if (schema.name == 'show_temperature') return 'Show Temperature Status';
    if (schema.name == 'temperature_order') return 'Temperature Order';
    if (schema.name == 'show_salinity') return 'Show Salinity Status';
    if (schema.name == 'salinity_order') return 'Salinity Order';
    if (schema.name == 'show_nutrition') return 'Show Nutrition';
    if (schema.name == 'nutrition_order') return 'Nutrition Order';
    return schema.name;
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }
    
    // Start with a fresh object with all defaults
    const newConfig = {
      device_id: "",
      title: "",
      display_mode: "full",
      show_light: true,
      light_order: "1",
      show_moisture: true,
      moisture_order: "2",
      show_temperature: true,
      temperature_order: "3",
      show_salinity: true,
      salinity_order: "4",
      show_nutrition: true,
      nutrition_order: "5"
    };
    
    // Copy existing config
    if (this.config) {
      Object.keys(this.config).forEach(key => {
        if (this.config[key] !== undefined && 
            key !== 'show_fertilize_days' && 
            key !== 'display_options' &&
            key !== 'show_ec' &&
            key !== 'sensor_order' &&
            !key.includes('_priority') &&
            !key.includes('_position')) {
          newConfig[key] = this.config[key];
        }
      });
    }
    
    // Then add the new values
    let orderChanged = false;
    let changedType = '';
    let oldValue = '';
    let newValue = '';
    
    if (ev.detail.value) {
      Object.keys(ev.detail.value).forEach(key => {
        // Special handling for order changes
        if (key.includes('_order')) {
          if (newConfig[key] !== ev.detail.value[key]) {
            orderChanged = true;
            changedType = key.split('_')[0]; // Extract sensor type (light, moisture, etc.)
            oldValue = newConfig[key];
            newValue = ev.detail.value[key];
          }
        }
        newConfig[key] = ev.detail.value[key];
      });
    }
    
    // If an order value was changed, find if any other sensor has the same new value
    // and swap them to maintain uniqueness
    if (orderChanged) {
      const sensorTypes = ['light', 'moisture', 'temperature', 'salinity', 'nutrition'];
      
      sensorTypes.forEach(type => {
        if (type !== changedType) {
          const orderKey = `${type}_order`;
          
          // If another sensor has the same order value as the new one, swap them
          if (newConfig[orderKey] === newValue) {
            newConfig[orderKey] = oldValue;
          }
        }
      });
    }
    
    // Special handling for device_id
    if (ev.detail.value.device_id !== undefined && ev.detail.value.device_id !== this._device_id) {
      if (ev.detail.value.device_id === "") {
        newConfig.title = "";
      } else if (newConfig.title === "") {
        try {
          const device = this.hass.devices[ev.detail.value.device_id];
          if (device && device.name) {
            newConfig.title = device.name;
          }
        } catch (e) {
          console.error("Error setting title from device name:", e);
        }
      }
    }

    this.configChanged(newConfig);
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass) {
      return html``;
    }
    if (!this.config) {
      return html``;
    }

    // Create a safe copy for the form to use - ensure all properties exist
    const formData = {
      device_id: this.config.device_id || "",
      title: this.config.title || "",
      display_mode: this.config.display_mode || "full",
      show_light: this.config.show_light !== undefined ? this.config.show_light : true,
      light_order: this.config.light_order || "1",
      show_moisture: this.config.show_moisture !== undefined ? this.config.show_moisture : true,
      moisture_order: this.config.moisture_order || "2",
      show_temperature: this.config.show_temperature !== undefined ? this.config.show_temperature : true,
      temperature_order: this.config.temperature_order || "3",
      show_salinity: this.config.show_salinity !== undefined ? this.config.show_salinity : true,
      salinity_order: this.config.salinity_order || "4",
      show_nutrition: this.config.show_nutrition !== undefined ? this.config.show_nutrition : true,
      nutrition_order: this.config.nutrition_order || "5"
    };

    return html`
      <div class="card-config">
        <div class="side-by-side">
          <ha-form
            .hass=${this.hass}
            .data=${formData}
            .schema=${SCHEMA}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `;
  }

  setConfig(config) {
    // Start with a fresh object with all defaults set
    const newConfig = {
      device_id: "",
      title: "",
      display_mode: "full",
      show_light: true,
      light_order: "1",
      show_moisture: true,
      moisture_order: "2",
      show_temperature: true,
      temperature_order: "3",
      show_salinity: true,
      salinity_order: "4",
      show_nutrition: true,
      nutrition_order: "5"
    };
    
    // Copy values from provided config
    if (config) {
      Object.keys(config).forEach(key => {
        if (config[key] !== undefined && 
            key !== 'show_fertilize_days' && 
            key !== 'display_options' &&
            key !== 'show_ec' &&
            key !== 'sensor_order' &&
            !key.includes('_priority') &&
            !key.includes('_position')) {
          newConfig[key] = config[key];
        }
      });
      
      // Handle legacy config with show_fertilize_days
      if (config.show_fertilize_days !== undefined) {
        // If show_fertilize_days was explicitly set to false but show_nutrition wasn't,
        // respect the fertilize days setting by disabling nutrition too
        if (config.show_fertilize_days === false && config.show_nutrition === undefined) {
          newConfig.show_nutrition = false;
        }
      }
      
      // Handle legacy config with sensor_order
      if (config.sensor_order && config.sensor_order !== 'default') {
        // Map from old-style ordering to new order values
        const orderMap = {
          'l': 'light',
          'm': 'moisture',
          't': 'temperature',
          's': 'salinity',
          'n': 'nutrition'
        };
        
        const order = config.sensor_order.split('');
        order.forEach((letter, index) => {
          if (orderMap[letter]) {
            const sensorType = orderMap[letter];
            newConfig[`${sensorType}_order`] = String(index + 1);
          }
        });
      }
      
      // Handle legacy config with priority or position values
      const sensorTypes = ['light', 'moisture', 'temperature', 'salinity', 'nutrition'];
      sensorTypes.forEach(type => {
        const priorityKey = `${type}_priority`;
        const positionKey = `${type}_position`;
        const orderKey = `${type}_order`;
        if (config[priorityKey] !== undefined) {
          newConfig[orderKey] = String(config[priorityKey]);
        } else if (config[positionKey] !== undefined) {
          newConfig[orderKey] = String(config[positionKey]);
        }
      });
    }
    
    if (newConfig.device_id !== "" && newConfig.title === "" && this.hass) {
      try {
        const device = this.hass.devices[newConfig.device_id];
        if (device && device.name) {
          newConfig.title = device.name;
        }
      } catch (e) {
        console.error("Error setting title from device name:", e);
      }
    }

    // Ensure at least one option is selected
    const hasSelection = 
      newConfig.show_light || 
      newConfig.show_moisture || 
      newConfig.show_temperature || 
      newConfig.show_salinity ||
      newConfig.show_nutrition;
    
    if (!hasSelection) {
      // Default to showing all if nothing selected
      newConfig.show_light = true;
      newConfig.show_moisture = true;
      newConfig.show_temperature = true;
      newConfig.show_salinity = true;
      newConfig.show_nutrition = true;
    }

    this.config = newConfig;
  }
}

customElements.define("fyta-plant-card-editor", FytaPlantCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fyta-plant-card",
  name: "Fyta Plant Card",
  preview: true,
  description: "Custom card for FYTA plant sensors with battery indicator and customizable layout"
});