const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "device_id", required: true, selector: { device: { integration: 'fyta' } } }
];

class FytaPlantCard extends HTMLElement {

  static getConfigElement() {
    return document.createElement("fyta-plant-card-editor");
  }

  static getStubConfig() {
    return { device_id: "", title: ""};
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._initialized = false;
    this._plant_image = "";
    this._sensor_entities = {battery_entity: "", light_entity: "", moisture_entity: "", salinity_entity: "", temperature_entity: ""};
    this._status_entities = { plant_status: "", light_status: "", moisture_status: "", salinity_status: "", nutrients_status: "", temperature_status: "" };
    
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
      salinity_entity: "mdi:emoticon-poop"
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

  _computeBatteryIcon(state) {
    if (state <= 5) {
      return "mdi:battery-alert";
    } else if (state <= 20) {
      return "mdi:battery-20";
    } else if (state <= 30) {
      return "mdi:battery-30";
    } else if (state <= 40) {
      return "mdi:battery-40";
    } else if (state <= 50) {
      return "mdi:battery-50";
    } else if (state <= 60) {
      return "mdi:battery-60";
    } else if (state <= 70) {
      return "mdi:battery-70";
    } else if (state <= 80) {
      return "mdi:battery-80";
    } else if (state <= 90) {
      return "mdi:battery-90";
    }
    return "mdi:battery";
  }

  _fire(type, detail) {
    const event = new Event(type, {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detail = detail || {};
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
    } else if (key === 'temperature_entity') {
      return this._measurementStatusColor[hass.states[this._status_entities.temperature_status]?.state || "no_data"];
    } else if (key === 'plant') {
      return this._plantStatusColor[hass.states[this._status_entities.plant_status]?.state || "no_sensor"];
    }
    
    return "var(--primary-text-color, white)";
  }

  getCardSize() {
    return 5;
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
    this.config = config;

    if (!config.device_id) {
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
      this.config = { ...this.config, title: device_name };
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
        padding-top: 8px;
        height: 72px;
      }

      .header > img {
        border-radius: 50%;
        width: 88px;
        height: 88px;
        object-fit: cover;
        margin-left: 16px;
        margin-right: 16px;
        margin-top: -32px;
        float: left;
        box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
        cursor: pointer;
      }

      .header > #name {
        font-weight: bold;
        width: 100%;
        margin-top: 16px;
        text-transform: capitalize;
        display: block;
        cursor: pointer;
      }

      #name ha-icon {
        color: rgb(240, 163, 163);
      }

      .header > #species {
        text-transform: capitalize;
        color: #8c96a5;
        display: block;
        cursor: pointer;
      }

      #battery {
        float: right;
        margin-right: 16px;
        margin-top: -15px;
      }

      .attributes {
        display: flex;
        flex-wrap: wrap;
        white-space: nowrap;
        padding: 8px;
      }

      .attribute {
        white-space: nowrap;
        display: flex;  
        align-items: center;
        width: 50%;
        margin-bottom: 8px;
        cursor: pointer;
      }

      .attribute ha-icon {
        margin-right: 10px;
        margin-left: 5px;
      }

      .sensor-value {
        flex-grow: 1;
      }

      .meter {
        height: 8px;
        background-color: var(--primary-background-color);
        border-radius: 2px;
        margin-right: 5px;
        display: inline-grid;
        overflow: hidden;
        flex-grow: 10;
        max-width: 40%;
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
      }
    `;

    content.id = "container";
    content.innerHTML = `
      <div class="header">
        <img src="${this._plant_image}" @click="${this._click.bind(this, this._status_entities.plant_status)}">
        <span id="name" style="color:${this._getStateColor("plant", hass)};" @click="${this._click.bind(this, this._status_entities.plant_status)}">${this.config.title} <ha-icon .icon="mdi:${hass.states[this._status_entities.plant_status].state === 'need_attention' ? "alert-circle-outline" : ""}"></ha-icon>
        </span>
        <span id="battery">${this._renderBattery(hass)}</span>
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

    this._initialized = true;
  }

  _renderBattery(hass) {
    if (this._sensor_entities.battery_entity === "") {
      return "";
    }

    const entity = this._sensor_entities.battery_entity;
    const state = parseInt(hass.states[entity].state);
    
    let icon = "mdi:battery";
    let color = "green";
    let statusText = "Good";
    
    if (state <= 5) {
      icon = "mdi:battery-alert";
      color = "red";
      statusText = "Critical";
    } else if (state <= 20) {
      icon = "mdi:battery-20";
      color = "red";
      statusText = "Very Low";
    } else if (state <= 30) {
      icon = "mdi:battery-30";
      color = "orange";
      statusText = "Low";
    } else if (state <= 40) {
      icon = "mdi:battery-40";
      color = "orange";
      statusText = "Medium Low";
    } else if (state <= 50) {
      icon = "mdi:battery-50";
      color = "green";
      statusText = "Medium";
    } else if (state <= 60) {
      icon = "mdi:battery-60";
      color = "green";
      statusText = "Medium High";
    } else if (state <= 70) {
      icon = "mdi:battery-70";
      color = "green";
      statusText = "High";
    } else if (state <= 80) {
      icon = "mdi:battery-80";
      color = "green";
      statusText = "Very High";
    } else if (state <= 90) {
      icon = "mdi:battery-90";
      color = "green";
      statusText = "Excellent";
    }
    
    return `
      <div class="battery tooltip" @click="${this._click.bind(this, entity)}">
        <div class="tip" style="text-align:center;">Battery: ${state}%<br>Status: ${statusText}</div>
        <ha-icon icon="${icon}" style="color: ${color};"></ha-icon>
      </div>
    `;
  }

  _renderSensors(hass) {
    const sensorKeys = ['light_entity', 'moisture_entity', 'temperature_entity', 'salinity_entity'];
    let sensorHtml = "";
    
    sensorKeys.forEach(key => {
      if (this._sensor_entities[key] !== "") {
        const entity = this._sensor_entities[key];
        const state = hass.states[entity].state;
        const uom = hass.states[entity].attributes.unit_of_measurement || "";
        
        // Get the proper status entity - use nutrients_status for salinity
        let statusEntity;
        let statusState = "";
        
        if (key === 'salinity_entity') {
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
        
        // Icon based on sensor type
        let icon = this._icons[key];
        
        sensorHtml += `
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
      }
    });
    
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
      const iconElement = nameElement.querySelector('ha-icon');
      if (iconElement) {
        iconElement.icon = `mdi:${hass.states[this._status_entities.plant_status].state === 'need_attention' ? "alert-circle-outline" : ""}`;
      }
    }
    
    // Update battery
    const batteryElement = this.shadowRoot.querySelector('#battery');
    if (batteryElement) {
      batteryElement.innerHTML = this._renderBattery(hass);
    }
    
    // Update sensor values
    const sensorKeys = ['light_entity', 'moisture_entity', 'temperature_entity', 'salinity_entity'];
    
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
            const statusKey = key.replace("_entity", "_status");
            
            // Get the proper status entity - use nutrients_status for salinity
            let statusEntity;
            let statusState = "";
            
            if (key === 'salinity_entity') {
              statusEntity = this._status_entities.nutrients_status;
              if (statusEntity) {
                statusState = hass.states[statusEntity].state;
              }
            } else {
              statusEntity = this._status_entities[statusKey];
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
    return '';
  }

  get _title() {
    return this.config?.title || '';
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }

    if (this.config.device_id === ev.detail.value.device_id && this.config.title === ev.detail.value.title) {
      return;
    }

    this.config.device_id = ev.detail.value.device_id;

    if (ev.detail.value.title === "" && this.config.device_id != "") {
      const device = this.hass.devices[this.config.device_id];

      this.config.title = device.name;
    } else {
      this.config.title = ev.detail.value.title;
    }

    this.configChanged(this.config);
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

    return html`
      <div class="card-config">
        <div class="side-by-side">
          <ha-form
            .hass=${this.hass}
            .data=${this.config}
            .schema=${SCHEMA}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `;
  }

  setConfig(config) {

    if (config.title === "" && config.device_id != "" && this.hass) {
      const device = this.hass.devices[config.device_id];

      config.title = device.name;
    }

    this.config = deepClone(config);
  }

}

customElements.define("fyta-plant-card-editor", FytaPlantCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "fyta-plant-card",
  name: "Fyta Plant Card",
  preview: true,
  description: "Custom card for your FYTA plant data"
});