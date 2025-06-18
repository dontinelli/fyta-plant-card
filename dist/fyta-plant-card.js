import {
  LitElement,
  nothing,
  html,
  css,
} from "https://unpkg.com/lit-element@4.2.0/lit-element.js?module";
import { join } from "https://unpkg.com/lit-html@3.3.0/directives/join.js?module";
import { map } from "https://unpkg.com/lit-html@3.3.0/directives/map.js?module";

const CUSTOM_CARD_NAME = 'fyta-plant-card';

const DeviceClass = {
  BATTERY: 'battery',
  MOISTURE: 'moisture',
  TEMPERATURE: 'temperature',
};

const DisplayMode = {
  FULL: 'full',
  COMPACT: 'compact',
};

const EntityType = {
  IMAGE: 'image',
  SENSOR: 'sensor',
};

const MeasurementStatusStates = {
  NO_DATA: 'no_data',
  TOO_LOW: 'too_low',
  LOW: 'low',
  PERFECT: 'perfect',
  HIGH: 'high',
  TOO_HIGH: 'too_high',
};

const MeasurementStatusColors = {
  [MeasurementStatusStates.NO_DATA]: 'var(--disabled-text-color, #bdbdbd)',
  [MeasurementStatusStates.TOO_LOW]: 'var(--red-color, #f44336)',
  [MeasurementStatusStates.LOW]: 'var(--orange-color, #ff9800)',
  [MeasurementStatusStates.PERFECT]: 'var(--green-color, #4caf50)',
  [MeasurementStatusStates.HIGH]: 'var(--orange-color, #ff9800)',
  [MeasurementStatusStates.TOO_HIGH]: 'var(--red-color, #f44336)',
};

const PlantStatusStates = {
  DELETED: 'deleted',
  DOING_GREAT: 'doing_great',
  NEED_ATTENTION: 'need_attention',
  NO_SENSOR: 'no_sensor',
};

const PlantStautsColors = {
  [PlantStatusStates.DELETED]: 'var(--disabled-text-color, #bdbdbd)',
  [PlantStatusStates.DOING_GREAT]: 'var(--green-color, #4caf50)',
  [PlantStatusStates.NEED_ATTENTION]: 'var(--orange-color, #ff9800)',
  [PlantStatusStates.NO_SENSOR]: 'var(--disabled-text-color, #bdbdbd)',
};

const PlantStateColorState = {
  DISABLED: 'disabled',
  IMAGE: 'image',
  NAME: 'name',
};

const PreferredPlantImage = {
  USER: 'user',
  DEFAULT: 'default',
};

const SensorTypes = {
  BATTERY: 'battery',
  FERTILIZATION_LAST: 'fertilizationLast',
  FERTILIZATION_NEXT: 'fertilizationNext',
  LIGHT: 'light',
  LIGHT_STATE: 'light',
  MOISTURE: 'moisture',
  MOISTURE_STATE: 'moisture',
  NUTRIENTS: 'nutrients',
  NUTRIENTS_STATE: 'nutrients',
  PLANT_IMAGE_DEFAULT: 'plant_image_default',
  PLANT_IMAGE_USER: 'plant_image_user',
  PLANT_STATE: 'plant',
  SALINITY: 'salinity',
  SALINITY_STATE: 'salinity',
  SCIENTIFIC_NAME: 'scientificName',
  TEMPERATURE: 'temperature',
  TEMPERATURE_STATE: 'temperature',
};

const TranslationKeys = {
  FERTILIZATION_LAST: 'last_fertilised',
  FERTILIZATION_NEXT: 'next_fertilisation',
  LIGHT: 'light',
  LIGHT_STATUS: 'light_status',
  MOISTURE_STATUS: 'moisture_status',
  NUTRIENTS_STATUS: 'nutrients_status',
  PLANT_IMAGE_USER: 'plant_image_user',
  PLANT_STATUS: 'plant_status',
  SALINITY: 'salinity',
  SALINITY_STATUS: 'salinity_status',
  SCIENTIFIC_NAME: 'scientific_name',
  TEMPERATURE_STATUS: 'temperature_status',
};

const DEFAULT_CONFIG = {
  battery_threshold: 30,
  device_id: '',
  display_mode: DisplayMode.FULL,
  sensors: [
    { type: SensorTypes.LIGHT, isEnabled: true },
    { type: SensorTypes.MOISTURE, isEnabled: true },
    { type: SensorTypes.TEMPERATURE, isEnabled: true },
    { type: SensorTypes.NUTRIENTS, isEnabled: true },
    { type: SensorTypes.SALINITY, isEnabled: false },
  ],
  preferred_image: PreferredPlantImage.USER,
  show_scientific_name: true,
  state_color_battery: true,
  state_color_icon: true,
  state_color_plant: PlantStateColorState.NAME,
  state_color_sensor: true,
  title: '',
};

const SCHEMA_PART_ONE = [
  {
    name: 'header_device',
    type: 'constant',
    label: 'Plant',
  },
  {
    name: 'device_id',
    label: 'Device (Required)',
    required: true,
    selector: {
      device: {
        integration: 'fyta',
      },
    },
  },
  {
    name: 'title',
    label: 'Title',
    selector: {
      text: {},
    },
  },
  {
    name: 'header_measurements',
    type: 'constant',
    label: 'Sensor Measurements',
  },
  {
    name: 'battery_threshold',
    label: 'Battery Threshold (%)',
    selector: {
      number: {
        min: 0,
        max: 100,
        step: 5,
        mode: 'slider',
      },
    },
    default: DEFAULT_CONFIG.battery_threshold,
  },
];

const SCHEMA_PART_TWO = [
  {
    name: 'nutrition_info',
    type: 'constant',
    label: 'Nutrition and Salinity',
    value: 'The Nutrition Score combines multiple measurements (salinity, conductivity, growth data, and fertilization timing) into a single metric. Showing salinity separately is generally not needed as it is already included in this score.',
  },
  {
    name: 'header_layout',
    type: 'constant',
    label: 'Layout',
  },
  {
    name: 'display_mode',
    label: 'Display Mode',
    selector: {
      select: {
        options: [
          { label: 'Full', value: DisplayMode.FULL },
          { label: 'Compact', value: DisplayMode.COMPACT },
        ],
        mode: 'box',
      },
    },
    default: DEFAULT_CONFIG.display_mode,
  },
  {
    name: 'state_color_plant',
    label: 'Expose plant state',
    selector: {
      select: {
        options: [
          { label: 'Name Color', value: PlantStateColorState.NAME },
          { label: 'Image Halo', value: PlantStateColorState.IMAGE },
          { label: 'Disabled', value: PlantStateColorState.DISABLED },
        ],
        mode: 'box',
      },
    },
    default: DEFAULT_CONFIG.state_color_plant,
  },
  {
    name: 'preferred_image',
    label: 'Preferred plant image',
    selector: {
      select: {
        options: [
          { label: 'User Image', value: PreferredPlantImage.USER },
          { label: 'Default Image', value: PreferredPlantImage.DEFAULT },
        ],
        mode: 'box',
      },
    },
    default: DEFAULT_CONFIG.preferred_image,
  },
  {
    type: 'grid',
    schema: [
      {
        name: 'show_scientific_name',
        label: 'Show scientific name',
        type: 'boolean',
        selector: { boolean: {} },
        default: DEFAULT_CONFIG.show_scientific_name,
      },
      {
        name: 'state_color_battery',
        label: 'Show battery state color',
        selector: { boolean: {} },
        default: DEFAULT_CONFIG.state_color_battery,
      },
    ],
  },
  {
    type: 'grid',
    schema: [
      {
        name: 'state_color_sensor',
        label: 'Show sensor state color',
        selector: { boolean: {} },
        default: DEFAULT_CONFIG.state_color_sensor,
      },
      {
        name: 'state_color_icon',
        label: 'Show colored state icons ',
        selector: { boolean: {} },
        default: DEFAULT_CONFIG.state_color_icon,
      },
    ],
  },
];

const SENSOR_SETTINGS = {
  [SensorTypes.BATTERY]: {
    min: 0,
    max: 100,
    icon: 'mdi:battery',
    name: 'Battery',
  },
  [SensorTypes.LIGHT]: {
    icon: 'mdi:white-balance-sunny',
    name: 'Light',
  },
  [SensorTypes.MOISTURE]: {
    min: 0,
    max: 100,
    icon: 'mdi:water',
    name: 'Soil Moisture',
  },
  [SensorTypes.NUTRIENTS]: {
    icon: 'mdi:bucket',
    name: 'Nutrition',
  },
  [SensorTypes.TEMPERATURE]: {
    min: 0,
    max: 50,
    icon: 'mdi:thermometer',
    name: 'Ambient Temperature',
  },
  [SensorTypes.SALINITY]: {
    icon: 'mdi:water-percent',
    name: 'Salinity',
  },
};

const parseConfig = (config) => {
  // Create a completely new config object with all defaults set
  const newConfig = { ...DEFAULT_CONFIG };

  let containsLegacyKeys = false;
  // Then copy values from provided config
  if (config) {
    Object.keys(config).forEach((key) => {
      if (
        key.includes('_order') ||
        ['show_light', 'show_moisture', 'show_temperature', 'show_nutrition', 'show_salinity'].includes(key)
      ) {
        containsLegacyKeys = true;
      } else {
        newConfig[key] = config[key];
      }
    });
  }

  // Upgrade legacy config from sensor order values
  if (containsLegacyKeys) {
    const LegacySensorType = {
      NUTRITION: 'nutrition'
    };

    const leygacySensorKeyTypes = [
      SensorTypes.LIGHT,
      SensorTypes.MOISTURE,
      SensorTypes.TEMPERATURE,
      SensorTypes.SALINITY,
      LegacySensorType.NUTRITION,
    ];

    newConfig.sensors = leygacySensorKeyTypes
      .map((sensorType) => {
        const orderKey = `${sensorType}_order`;

        let orderValue = 5;
        if (config[orderKey] !== undefined) {
          orderValue = String(config[orderKey]);
        }
        const type = sensorType === LegacySensorType.NUTRITION ? SensorTypes.NUTRIENTS : sensorType;
        return { type, order: orderValue, isEnabled: config[`show_${sensorType}`] || false };
      })
      .sort((a, b) => a.order - b.order)
      .map(({ type, isEnabled }) => {
        return { type, isEnabled };
      });
  }

  if (newConfig.sensors.length === 0) {
    newConfig.sensors = DEFAULT_CONFIG.sensors;
  }

  // Upgrade legacy config from boolean plant state color value
  if (typeof newConfig.state_color_plant === 'boolean') {
    newConfig.state_color_plant = newConfig.state_color_plant === true ? PlantStateColorState.NAME : PlantStateColorState.IMAGE;
  }

  return newConfig;
};

class FytaPlantCard extends LitElement {
  static getConfigElement() {
    return document.createElement(`${CUSTOM_CARD_NAME}-editor`);
  }

  static getStubConfig() {
    return DEFAULT_CONFIG;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this._measurementEntityIds = {
      [SensorTypes.BATTERY]: '',
      [SensorTypes.LIGHT]: '',
      [SensorTypes.MOISTURE]: '',
      [SensorTypes.TEMPERATURE]: '',
      [SensorTypes.SALINITY]: '',
    };

    this._stateEntityIds = {
      [SensorTypes.LIGHT_STATE]: '',
      [SensorTypes.MOISTURE_STATE]: '',
      [SensorTypes.NUTRIENTS_STATE]: '',
      [SensorTypes.PLANT_STATE]: '',
      [SensorTypes.SALINITY_STATE]: '',
      [SensorTypes.TEMPERATURE_STATE]: '',
    };

    this._otherEntityIds = {
      [SensorTypes.FERTILIZATION_LAST]: '',
      [SensorTypes.FERTILIZATION_NEXT]: '',
      [SensorTypes.PLANT_IMAGE_DEFAULT]: '',
      [SensorTypes.PLANT_IMAGE_USER]: '',
      [SensorTypes.SCIENTIFIC_NAME]: '',
    };
  }

  _calculateSize(gridSize) {
    // Calculate card size dependent on display mode and number of sensors shown
    const baseHeight = this.config?.display_mode === DisplayMode.FULL ? 130 : 90; // Base size

    // Count enabled sensors and add 0.5 to base size for each sensor beyond the first 2
    const sensorCount = this.config.sensors?.reduce((accumulator, item) => accumulator + (item?.isEnabled ? 1 : 0), 0);
    const attributesHeight = Math.ceil(sensorCount / 2) * 30;

    const cardHeight = baseHeight + attributesHeight;

    return Math.ceil(cardHeight / gridSize * 2) / 2;
  }

  getCardSize() {
    return this._calculateCardSize(50);
  }

  getLayoutOptions() {
    const gridRows = this._calculateSize(56);

    return {
      grid_rows: gridRows,
      grid_columns: 4,
      grid_min_rows: 3,
      grid_min_columns: 2,
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this.config = parseConfig(config);
  }

  _calculateDaysFromNow(inputDateString) {
    if (!inputDateString) return null;

    // Create Date object for the current date - use local midnight
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Create Date object for the input date handling ISO input format (YYYY-MM-DDThh:mm:ss)
    const inputDate = new Date(inputDateString);

    // Calculate time difference in milliseconds
    const timeDifference = inputDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days
    const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    return Math.ceil(timeDifference / DAY_IN_MILLISECONDS);
  }

  _click(entityId) {
    if (!entityId) return;
    const event = new Event(('hass-more-info'), {
      bubbles: true,
      cancelable: false,
      composed: true,
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
    return event;
  }

  _getStateColor(stateType, hass) {
    switch (stateType) {
      case SensorTypes.LIGHT_STATE:
      case SensorTypes.MOISTURE_STATE:
      case SensorTypes.NUTRIENTS_STATE:
      case SensorTypes.SALINITY_STATE:
      case SensorTypes.TEMPERATURE_STATE: {
        const entityId = this._stateEntityIds[stateType];
        const state = hass.states[entityId]?.state || MeasurementStatusStates.NO_DATA;
        return MeasurementStatusColors[state];
      }
      case SensorTypes.PLANT_STATE: {
        const entityId = this._stateEntityIds[stateType];
        const state = hass.states[entityId]?.state || PlantStatusStates.NO_SENSOR;
        return PlantStautsColors[state];
      }
      default: {
        return 'var(--primary-text-color, #ffffff)';
      }
    }
  }

  // Format date for display: Remove time component
  _formatDateForDisplay(dateString) {
    if (!dateString) return '';

    // If date contains a T (ISO format), split and return just the date part
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }

    return dateString;
  }

  // Format unit for card display (only show part before "/" if it exists)
  _formatDisplayUnit(unit) {
    if (!unit) return '';
    const parts = unit.split('/');
    return parts[0];
  }

  _getPlantImageSrc(hass) {
    if (this.config.preferred_image === PreferredPlantImage.USER) {
      const userImageEntityId = this._otherEntityIds[SensorTypes.PLANT_IMAGE_USER];

      if (userImageEntityId && hass.states[userImageEntityId]?.attributes.entity_picture) {
        return hass.states[userImageEntityId]?.attributes.entity_picture || '';
      }
    }

    const defaultImageEntityId = this._otherEntityIds[SensorTypes.PLANT_IMAGE_DEFAULT];
    if (defaultImageEntityId && hass.states[defaultImageEntityId]?.attributes.entity_picture) {
      return hass.states[defaultImageEntityId]?.attributes.entity_picture || '';
    }

    return '';
  };

  _handleEntity(id, hass) {
    const hassState = hass.states[id];
    if (!hassState) return;

    const hassEntity = hass.entities[id];
    if (!hassEntity) return;

    if (id.startsWith('image.')) {
      if (hassEntity.translation_key === TranslationKeys.PLANT_IMAGE_USER) {
        this._otherEntityIds[SensorTypes.PLANT_IMAGE_USER] = hassState.entity_id;
        return;
      }
      this._otherEntityIds[SensorTypes.PLANT_IMAGE_DEFAULT] = hassState.entity_id;
      return;
    }

    if (id.startsWith(EntityType.IMAGE)) {
      this._plantImage = hass.states[id].attributes.entity_picture;
      return;
    }

    if (id.startsWith(EntityType.SENSOR)) {
      switch (hassEntity.translation_key) {
        case TranslationKeys.LIGHT_STATUS:
        case TranslationKeys.MOISTURE_STATUS:
        case TranslationKeys.NUTRIENTS_STATUS:
        case TranslationKeys.PLANT_STATUS:
        case TranslationKeys.SALINITY_STATUS:
        case TranslationKeys.TEMPERATURE_STATUS: {
          this._stateEntityIds[hassEntity.translation_key.replace('_status', '')] = hassState.entity_id;
          return;
        }

        case TranslationKeys.FERTILIZATION_LAST: {
          this._otherEntityIds[SensorTypes.FERTILIZATION_LAST] = hassState.entity_id;
          return;
        }
        case TranslationKeys.FERTILIZATION_NEXT: {
          this._otherEntityIds[SensorTypes.FERTILIZATION_NEXT] = hassState.entity_id;
          return;
        }
        case TranslationKeys.LIGHT: {
          this._measurementEntityIds[SensorTypes.LIGHT] = hassState.entity_id;
          return;
        }
        case TranslationKeys.SALINITY: {
          this._measurementEntityIds[SensorTypes.SALINITY] = hassState.entity_id;
          return;
        }
        case TranslationKeys.SCIENTIFIC_NAME: {
          this._otherEntityIds[SensorTypes.SCIENTIFIC_NAME] = hassState.entity_id;
          return;
        }

        default: {
          switch (hassState.attributes.device_class) {
            case DeviceClass.BATTERY:
            case DeviceClass.MOISTURE:
            case DeviceClass.TEMPERATURE: {
              this._measurementEntityIds[hassState.attributes.device_class] = hassState.entity_id;
              return;
            }
          }
        }
      }
    }
  }

  _handleEntities(hass, deviceId) {
    Object.keys(hass.entities)
      .filter((id) => hass.entities[id].device_id === deviceId)
      .forEach((id) => this._handleEntity(id, hass), this);
  }

  static get styles() {
    return css`
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
        position: relative;
        display: flex;
      }

      .header #plant-image {
        width: 90px;
        margin: -28px 16px 0px;
      }

      .header #plant-image > img {
        border-radius: 50%;
        width: 90px;
        height: 90px;
        object-fit: cover;
        box-shadow: var( --ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2) );
        cursor: pointer;
      }

      .header #plant-image > img.state {
        width: 86px;
        height: 86px;
        border-color: var(--disabled-text-color, #bdbdbd);
        border-width: 2px;
        border-style: solid;
      }

      .header #plant-text {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        margin-right: 12px;
        height: 44px;
        justify-content: center;
        overflow: hidden;
      }

      .header #plant-text > #name {
        font-weight: bold;
        text-wrap: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
      }

      .header #plant-text > #scientific-name {
        color: var(--secondary-text-color, #727272);
        text-wrap: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
      }

      .header #plant-battery {
        margin-top: 18px;
        margin-right: 16px;
        cursor: pointer;
      }

      .attributes {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 16px 16px 8px;
        white-space: nowrap;
      }

      .attribute {
        white-space: nowrap;
        display: flex;
        align-items: center;
        width: 100%;
        padding-bottom: 8px;
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
        background-color: var(--primary-background-color, #fafafa);
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
        background-color: var(--primary-text-color, #212121);
      }

      .meter > .good {
        background-color: var(--green-color, #4caf50);
      }

      .meter > .bad {
        background-color: var(--red-color, #f44336);
      }

      .meter > .warning {
        background-color: var(--orange-color, #ff9800);
      }

      .meter > .unavailable {
        background-color: var(--grey-color, #9e9e9e);
      }

      .divider {
        height: 1px;
        background-color: var(--secondary-text-color, #727272);
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
        background-color: var(--grey-color, #9e9e9e);
        color: var(--white-color, #ffffff);
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
        color: var(--secondary-text-color, #727272);
        font-size: 0.9em;
        flex-shrink: 0;
        text-align: left;
        width: 30px;
        margin-right: 4px;
      }

      .sensor-row {
      }

      .sensor-column {
        width: 50%;
        box-sizing: border-box;
      }

      .sensor-column-left {
        padding-right: 12px;      
      }

      .compact-mode .attribute {
        padding-bottom: 4px;
      }

      .compact-mode .meter {
        max-width: none;
      }

      .compact-mode .sensor-value,
      .compact-mode .uom {
        display: none;
      }

      .compact-mode #plant-text {
        margin-top: 8px;
      }

      /* We'll use the same header style as normal mode, but with reduced padding */
      .compact-mode .header {
        padding-top: 6px;
        height: 64px;
      }

      .compact-mode .header #plant-image {
        width: 78px;
        margin: -24px 16px 0px;
      }

      .compact-mode .header #plant-image > img {
        width: 78px;
        height: 78px;
      }

      .compact-mode .header #plant-image > img.state {
        width: 74px;
        height: 74px;
        border-color: var(--disabled-text-color, #bdbdbd);
        border-width: 2px;
        border-style: solid;
      }

      .compact-mode #plant-battery {
        margin-top: 16px;
      }

      /* Reduce padding in the attributes section for compact mode */
      .compact-mode .attributes {
        padding: 4px 16px 0px;
      }
    `;
  }

  render() {
    if (!this.hass || !this.config) {
      console.debug(`hass or config not set.`);
      return nothing;
    }

    // If no device is specified, show a configuration prompt
    if (!this.config.device_id) {
      return html`
        <ha-card>
          <hui-warning>
            Please select a FYTA device in the card configuration.
          </hui-warning>
        </ha-card>
      `;
    }

    const deviceId = this.config.device_id;
    if (!deviceId) {
      console.debug(`device_id not set.`);
      return;
    }

    const device = this.hass.devices[deviceId];

    // Create a new config object with all defaults
    if (!this.config?.title || this.config.title === '') {
      const newConfig = {
        ...DEFAULT_CONFIG,
        ...this.config,
        device_id: deviceId || '',
        title: device.name,
      };

      this.config = newConfig;
    }

    this._handleEntities(this.hass, deviceId);

    return html`
      <ha-card>
        <div id="container" class="${this.config.display_mode === DisplayMode.COMPACT ? 'compact-mode' : ''}">
          <div class="header">
            <div id="plant-image">
              <img
                src="${this._getPlantImageSrc(this.hass)}"
                class="${this.config.state_color_plant === PlantStateColorState.IMAGE ? 'state' : ''}"
                style="${this.config.state_color_plant === PlantStateColorState.IMAGE ? `border-color:${this._getStateColor(SensorTypes.PLANT_STATE, this.hass)};` : ''}"
                @click="${this._click.bind(this, this._stateEntityIds[SensorTypes.PLANT_STATE])}"
              >
            </div>
            <div id="plant-text">
              <span
                id="name"
                style="${this.config.state_color_plant === PlantStateColorState.NAME ? `color:${this._getStateColor(SensorTypes.PLANT_STATE, this.hass)};` : ''}"
                @click="${this._click.bind(this, this._stateEntityIds[SensorTypes.PLANT_STATE])}"
              >${this.config.title}</span>
              ${this.config.show_scientific_name ? html`<span id="scientific-name" @click="${this._click.bind(this, this._stateEntityIds[SensorTypes.PLANT_STATE])}">${this.hass.states[this._otherEntityIds[SensorTypes.SCIENTIFIC_NAME]]?.state || ''}</span>`: nothing}
            </div>
            ${this._renderBattery(this.hass)}
          </div>
          <div class="divider"></div>
          <div class="attributes">
            ${this._renderSensors(this.hass)}
          </div>
        </div>
      </ha-card>
    `;
  }

  _renderBattery(hass) {
    if (this._measurementEntityIds[SensorTypes.BATTERY] === '') {
      return nothing;
    }

    const entityId = this._measurementEntityIds[SensorTypes.BATTERY];
    const state = parseInt(hass.states[entityId].state);

    // Check against the user-configured threshold
    const threshold = this.config?.battery_threshold ?? DEFAULT_CONFIG.battery_threshold;

    // Only show battery if level is at or below the threshold
    // Skip showing if threshold is 0 (never show)
    if (threshold === 0 || state > threshold) {
      return '';
    }

    const BatteryStatusText = {
      GOOD: 'Good',
      FULL: 'Full',
      MEDIUM: 'Medium',
      LOW: 'Low',
      VERY_LOW: 'Very Low',
      CRITICAL: 'Critical',
      UNKNOWN: 'Unknown',
    };

    const thresholdLevels = [
      { threshold: 91, icon: 'mdi:battery', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.FULL },
      { threshold: 81, icon: 'mdi:battery-90', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.GOOD },
      { threshold: 71, icon: 'mdi:battery-80', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.GOOD },
      { threshold: 61, icon: 'mdi:battery-70', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.GOOD },
      { threshold: 51, icon: 'mdi:battery-60', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.GOOD },
      { threshold: 41, icon: 'mdi:battery-50', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.MEDIUM },
      { threshold: 31, icon: 'mdi:battery-40', color: 'var(--state-sensor-battery-high-color, #4caf50)', statusText: BatteryStatusText.MEDIUM },
      { threshold: 21, icon: 'mdi:battery-30', color: 'var(--state-sensor-battery-medium-color, #ff9800)', statusText: BatteryStatusText.LOW },
      { threshold: 11, icon: 'mdi:battery-20', color: 'var(--state-sensor-battery-medium-color, #ff9800)', statusText: BatteryStatusText.LOW },
      { threshold: 6, icon: 'mdi:battery-10', color: 'var(--state-sensor-battery-low-color, #f44336)', statusText: BatteryStatusText.VERY_LOW },
      { threshold: 0, icon: 'mdi:battery-alert', color: 'var(--state-sensor-battery-low-color, #f44336)', statusText: BatteryStatusText.CRITICAL },
      { threshold: -Infinity, icon: 'mdi:battery-alert-variant-outline', color: 'var(--state-sensor-battery-low-color, #f44336)', statusText: BatteryStatusText.UNKNOWN },
    ];

    const { icon, color, statusText } = thresholdLevels.find(({ threshold }) => state >= threshold) || { icon: 'mdi:battery-alert-variant-outline', color: 'var(--red-color, #f44336)', statusText: BatteryStatusText.UNKNOWN };

    return html`
      <div id="plant-battery">
        <div class="battery tooltip" @click="${this._click.bind(this, entityId)}">
          <div class="tip" style="text-align:center;">Battery: ${state}%<br>Status: ${statusText}</div>
          <ha-icon icon="${icon}" style="${this.config.state_color_battery ? `color: ${color};` : ''}"></ha-icon>
        </div>
      </div>
    `;
  }

  _calculateMeterState(sensorSettings, sensorState, statusState) {
    const MeterClass = {
      BAD: 'bad',
      GOOD: 'good',
      UNAVAILABLE: 'unavailable',
      WARNING: 'warning',
    };

    let percentage = null;
    if (sensorState !== null && sensorSettings.min !== null && sensorSettings.max != null) {
      const calculatedPercentage = (sensorState - sensorSettings.min) / (sensorSettings.max - sensorSettings.min) * 100;
      percentage = Math.max(0, Math.min(100, calculatedPercentage));
    }

    switch (statusState) {
      case MeasurementStatusStates.TOO_LOW: {
        return {
          percentage: percentage !== null ? percentage : 10,
          class: MeterClass.BAD,
        };
      }
      case MeasurementStatusStates.LOW: {
        return {
          percentage: percentage !== null ? percentage : 30,
          class: MeterClass.WARNING,
        };
      }
      case MeasurementStatusStates.PERFECT: {
        return {
          percentage: percentage !== null ? percentage : 50,
          class: MeterClass.GOOD,
        };
      }
      case MeasurementStatusStates.HIGH: {
        return {
          percentage: percentage !== null ? percentage : 70,
          class: MeterClass.WARNING,
        };
      }
      case MeasurementStatusStates.TOO_HIGH: {
        return {
          percentage: percentage !== null ? percentage : 90,
          class: MeterClass.BAD,
        };
      }
      default: {
        return { percentage: 0, class: MeterClass.UNAVAILABLE };
      }
    }
  }

  _buildNutritionTooltipContent(statusState, daysUntilFertilization, lastFertilizationDateString, nextFertilizationDateString) {
    const nutritionStatus = statusState.replace(/_/g, ' ');
    const showFertilization = daysUntilFertilization !== null && !isNaN(daysUntilFertilization);

    let fertilizationLine = nothing;
    if (showFertilization) {
      const daysText = Math.abs(daysUntilFertilization) === 1 ? 'day' : 'days';
      fertilizationLine = daysUntilFertilization >= 0
        ? html`<br>Fertilize in ${daysUntilFertilization} ${daysText}`
        : html`<br>Fertilization overdue by ${Math.abs(daysUntilFertilization)} ${daysText}`;
    }

    const lastFertilizationLine = lastFertilizationDateString
      ? html`<br>Last Fertilization: ${this._formatDateForDisplay(lastFertilizationDateString)}`
      : nothing;

    const nextFertilizationLine = nextFertilizationDateString
      ? html`<br>Next Fertilization: ${this._formatDateForDisplay(nextFertilizationDateString)}`
      : nothing;

    return html`Nutrition Status: ${nutritionStatus}${fertilizationLine}${lastFertilizationLine}${nextFertilizationLine}`;
  }

  _renderSensors(hass) {
    // Filter enabled sensors based on entity ID availability
    const visibleSensors = this.config.sensors?.filter((sensorSettings) => {
      return sensorSettings && sensorSettings.isEnabled && this._measurementEntityIds[sensorSettings.type] !== '';
    });

    if (!visibleSensors || visibleSensors.length === 0) {
      return nothing;
    }

    // Distribute items into columns considering their total number
    const leftColumnItems = [];
    const rightColumnItems = [];
    let fullWidthSensor = null;

    // Even number of sensors - distribute evenly
    // Odd number of sensors - always make the last item full-width
    visibleSensors.forEach((sensorSetting, index) => {
      if (index % 2 === 0) {
        if (index === visibleSensors.length - 1) {
          // Store the sensor that should be displayed full-width
          fullWidthSensor = sensorSetting.type;
        } else {
          leftColumnItems.push(sensorSetting.type);
        }
      } else {
        rightColumnItems.push(sensorSetting.type);
      }
    });

    // Render a single sensor
    const renderSensor = (sensorType) => {
      if (sensorType === SensorTypes.NUTRIENTS) {
        return renderNutrition();
      }

      const sensorEntityId = this._measurementEntityIds[sensorType];
      const sensorState = hass.states[sensorEntityId].state;

      // Get proper units for display and tooltip
      const unitOfMeasurement = hass.states[sensorEntityId].attributes.unit_of_measurement || '';

      // Get the proper status entity
      let statusState = '';

      const statusEntityId = this._stateEntityIds[sensorType];
      if (statusEntityId) {
        statusState = hass.states[statusEntityId].state;
      }

      const color = this._getStateColor(sensorType, hass);
      const sensorSettings = SENSOR_SETTINGS[sensorType];

      // Calculate meter width and class based on status
      const meterState = this._calculateMeterState(sensorSettings, sensorState, statusState);

      // Generate tooltip content with current value and status - use full unit
      const tooltipContent = html`${sensorSettings.name}: ${sensorState} ${unitOfMeasurement}${statusState ? html`<br>Status: ${statusState.replace(/_/g, ' ')}` : nothing}`;

      return html`
        <div class="attribute tooltip" @click="${this._click.bind(this, sensorEntityId)}" data-entity="${sensorEntityId}">
          <div class="tip" style="text-align:center;">${tooltipContent}</div>
          <ha-icon icon="${sensorSettings.icon}" style="${this.config.state_color_icon ? `color:${color};` : ''}"></ha-icon>
          <div class="meter">
            <span class="${this.config.state_color_sensor ? `${meterState.class}` : ''}" style="width: ${meterState.percentage}%;"></span>
          </div>
          <div class="sensor-value">${sensorState}</div>
          <div class="uom">${this._formatDisplayUnit(unitOfMeasurement)}</div>
        </div>
      `;
    };

    // Render nutrition status
    const renderNutrition = () => {
      const statusEntityId = this._stateEntityIds[SensorTypes.NUTRIENTS_STATE];
      const statusState = hass.states[statusEntityId]?.state;
      const color = this._getStateColor(SensorTypes.NUTRIENTS_STATE, hass);

      // Get fertilizations date if available
      const fertiliseLastEntityId = this._otherEntityIds[SensorTypes.FERTILIZATION_LAST];
      const fertiliseNextEntityId = this._otherEntityIds[SensorTypes.FERTILIZATION_NEXT];
      let daysUntilFertilization = null;
      let lastFertilizationDateString = null;
      let nextFertilizationDateString = null;

      if (fertiliseNextEntityId && hass.states[fertiliseNextEntityId]) {
        nextFertilizationDateString = hass.states[fertiliseNextEntityId].state;
        daysUntilFertilization = this._calculateDaysFromNow(nextFertilizationDateString);
      }

      if (fertiliseLastEntityId && hass.states[fertiliseLastEntityId]) {
        lastFertilizationDateString = hass.states[fertiliseLastEntityId].state;
      }

      // Format the next fertilization date for display
      const meterState = this._calculateMeterState(SENSOR_SETTINGS[SensorTypes.NUTRIENTS], null, statusState);

      // Build tooltip content
      const tooltipContent = this._buildNutritionTooltipContent(statusState, daysUntilFertilization, lastFertilizationDateString, nextFertilizationDateString);
      const sensorValue = daysUntilFertilization !== null && !isNaN(daysUntilFertilization) ? daysUntilFertilization : '-';

      return html`
        <div class="attribute tooltip" @click="${this._click.bind(this, statusEntityId)}" data-entity="${statusEntityId}">
          <div class="tip" style="text-align:center;">${tooltipContent}</div>
          <ha-icon icon="${SENSOR_SETTINGS[SensorTypes.NUTRIENTS].icon}" style="${this.config.state_color_icon ? ` color:${color};` : ''}"></ha-icon>
          <div class="meter">
            <span class="${this.config.state_color_sensor ? `${meterState.class}` : ''}" style="width: ${meterState.percentage}%;"></span>
          </div>
          <div class="sensor-value">${sensorValue}</div>
          <div class="uom">${Math.abs(daysUntilFertilization) === 1 ? 'day' : 'days'}</div>
        </div>
      `;
    };

    // Render sensors in two columns
    let sensorHtml = html`
      <div class="sensor-column sensor-column-left">
        ${join(
          map(leftColumnItems, (sensor) => renderSensor(sensor)),
          ''
        )}
      </div>
      <div class="sensor-column">
        ${join(
          map(rightColumnItems, (sensor) => renderSensor(sensor)),
          ''
        )}
      </div>
    `;

    // Add full-width item if needed
    if (fullWidthSensor) {
      return html`${sensorHtml}${renderSensor(fullWidthSensor)}`;
    }

    return sensorHtml;
  }
}

customElements.define(CUSTOM_CARD_NAME, FytaPlantCard);

export class FytaPlantCardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { state: true },
  };

  get deviceId() {
    return this.config?.device_id || '';
  }

  _computeLabel(schema) {
    // The schema already has labels, but for grids we need this function
    // to ensure proper display of field names
    return schema.label || schema.name;
  }

  _configChanged(config) {
    console.debug('Config changed:', config);
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config };
    this.dispatchEvent(event);
  }

  _handleChange(event) {
    console.debug('Handle change:', JSON.stringify(event), event);
    const item = event.currentTarget.closest('.item');
    const sensorType = item.getAttribute('data-sensor-type');

    let config = { ...this.config };

    let configSensors = config.sensors || DEFAULT_CONFIG.sensors;
    // Update the config with the new value
    configSensors = configSensors.map((sensorSettings) => {
      if (sensorSettings.type === sensorType) {
        return { ...sensorSettings, isEnabled: event.target.checked };
      }
      return sensorSettings;
    });

    // Enable default sensors if none are enabled
    if (configSensors.reduce((accumulator, item) => accumulator + (item.isEnabled ? 1 : 0), 0) === 0) {
      configSensors = configSensors.map(({ type }) => {
         return DEFAULT_CONFIG.sensors.find((defaultSensorSettings) => defaultSensorSettings.type === type);
      });
    }

    config.sensors = configSensors;

    this._configChanged(config);
  } 

  _itemMoved(event) {
    console.debug('Item moved:', JSON.stringify(event), event);
    event.stopPropagation();

    const { oldIndex, newIndex } = event.detail;

    const newItems = this.config.sensors.concat();
    newItems.splice(newIndex, 0, newItems.splice(oldIndex, 1)[0]);

    const config = { ...this.config, sensors: newItems };

    this._configChanged(config);
  }

  _valueChanged(event) {
    console.debug('Value changed:', JSON.stringify(event), event);
    if (!this.config || !this.hass) {
      return;
    }

    // Start with a fresh object with the old values
    const config = { ...this.config };

    if (event.detail?.value) {
      Object.keys(event.detail.value).forEach((key) => {
        config[key] = event.detail.value[key];
      });
    }

    this._configChanged(config);
  }

  _getSensorColor(sensorType, isEnabled) {
    if (!isEnabled) {
      return 'var(--disabled-color, #bdbdbd)';
    }

    switch (sensorType) {
      case SensorTypes.LIGHT: {
        return 'var(--yellow-color, #ffeb3b)';
      }
      case SensorTypes.MOISTURE: {
        return 'var(--blue-color, #2196f3)';
      }
      case SensorTypes.TEMPERATURE: {
        return 'var(--green-color, #4caf50)';
      }
      case SensorTypes.NUTRIENTS: {
        return 'var(--brown-color, #795548)';
      }
      case SensorTypes.SALINITY: {
        return 'var(--purple-color, #9c27b0)';
      }
      default: {
        return 'var(--disabled-color: #bdbdbd;)';
      }
    }
  }

  render() {
    if (!this.hass || !this.config) {
      return nothing;
    }

    return html`
      <div class="card-config">
        <div class="side-by-side">
          <ha-form
            .hass=${this.hass}
            .data=${this.config}
            .schema=${SCHEMA_PART_ONE}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
          <ha-sortable
            handle-selector=".handle"
            @item-moved=${this._itemMoved}
          >
            <div class="sensors">
              ${this.config?.sensors.map(({type, isEnabled}) => html`
                <div class="item"  data-sensor-type="${type}">
                  <div class="handle">
                    <ha-icon icon="mdi:drag"></ha-svg-icon>
                  </div>
                  <div class="item-switch">
                    <ha-switch
                      .checked=${isEnabled}
                      @change=${this._handleChange}
                    ></ha-switch>
                  </div>
                  <div class="item-icon">
                    <ha-icon
                      icon="${SENSOR_SETTINGS[type].icon}"
                      style="color:${this._getSensorColor(type, isEnabled)}"></ha-svg-icon>
                  </div>
                  <div class="item-label">${SENSOR_SETTINGS[type].name}</div>
                </div>
              `
              )}
            </div>
          </ha-sortable>
          <ha-form
            .hass=${this.hass}
            .data=${this.config}
            .schema=${SCHEMA_PART_TWO}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .item {
        display: flex;
        margin-top: 8px;
        align-items: center;
        padding: 8px;
      }
      .item .handle {
        padding-right: 16px;
        cursor: move;
        cursor: grab;
        padding-inline-start: initial;
        padding-inline-end: 8px;
        direction: var(--direction);
      }
      .item .handle > * {
        pointer-events: none;
      }
      .item .item-switch, .item .item-icon {
        padding-right: 16px;
      }
      .item .item-label {
        flex-grow: 1;
      }
      .sensors {
        margin-bottom: 12px;
      }
    `;
  }

  setConfig(config) {
    // Start with a fresh object with all defaults set
    const newConfig = parseConfig(config);

    if (newConfig.device_id !== '' && newConfig.title === '' && this.hass) {
      try {
        const device = this.hass.devices[newConfig.device_id];
        if (device && device.name) {
          newConfig.title = device.name;
        }
      } catch (error) {
        console.error('Error setting title from selected device:', error);
      }
    }

    this.config = newConfig;
  }
}

customElements.define(`${CUSTOM_CARD_NAME}-editor`, FytaPlantCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CUSTOM_CARD_NAME,
  name: 'FYTA Plant Card',
  preview: true,
  description: 'Custom card for your FYTA plant data',
});
