import React from 'react';
import {json} from 'd3-fetch';
import {geoEquirectangular, geoPath} from 'd3-geo';
import {event, select} from 'd3-selection';
import {zoom} from 'd3-zoom';
import {findStateData, getDataName, buildColormapValue, rankArray} from './utils';

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      features: [],
      height: 400,
      projection: null,
      width: this.props.width
    };
  }

  componentDidMount() {
    json('./data/custom.geo.json').then((data) => {
      this.setState({
        features: data.features
      });
    });
  }

  render() {
    const projection = geoEquirectangular()
      .center([0, 15])
      .scale([this.state.width / (2 * Math.PI)])
      .translate([this.state.width / 2, this.state.height / 2]);

    const allData = [];
    this.props.data.forEach((e) => {
      const keys = Object.keys(e).filter(key => !isNaN(Number(key)) && key !== '');
      keys.forEach((key) => {
        if (!isNaN(Number(e[key]))) {
          allData.push(Number(e[key]));
        }
      });
    });

    const ranks = rankArray(allData);
    let maxrank = Object.values(ranks);
    if (maxrank.length !== 0) {
      maxrank = maxrank.reduce((acc, d) => (d > acc ? d : acc));
    }

    const path = geoPath().projection(projection);
    /* To use abbreviation instead of full country name: d.properties.iso_a3 */
    const countries = this.state.features.map((d, i) => {
      const currPath = path(d);
      let fill = '#A3A3A3';
      const colorScale = buildColormapValue(0, maxrank);
      const countryName = getDataName(d.properties.admin);
      const countryData = findStateData(this.props.data, countryName);
      if (countryData) {
        if (isNaN(Number(countryData[this.props.year]))) {
          fill = '#A3A3A3';
        } else {
          const val2color = Number(countryData[this.props.year]);
          fill = colorScale(ranks[val2color]);
        }
      }
      return (
        <path
          d={currPath}
          id={`${d.properties.admin}`}
          className="country"
          fill={fill}
          onClick={(e) => this.props.modifyCountry(e.target.id) }
          key={`country-${i}`}
          stroke="#2A2C39"
        />
      );
    });

    const svg = select('.map');
    const map = select('.map__countries');
    function zoomed() {
      map.attr('transform', event.transform);
    }

    const zoom1 = zoom()
      .translateExtent([[-100, -100], [this.state.width + 100, this.state.height + 100]])
      .scaleExtent([1, 10])
      .on('zoom', zoomed);
    svg.call(zoom1);
    let selectMin = 10;
    let selectMax = 100;
    let selectUnit = '';
    const dataMinsMaxs = {
      Sanitation: ['low', 'high', 'Percent of Population with Access'],
      'Death Rate': ['low', 'high', 'Death Rate per 1000 People'],
      'Drinking Water': ['low', 'high', 'Percent of Population with Access'],
      Fertility: ['low', 'high', 'Number of Births per Woman'],
      'Life Expectancy': ['low', 'high', 'Life Expectancy in Years'],
      'Labor Participation': ['low', 'high', 'Percent of Total Population'],
      'Internet Access': ['low', 'high', 'Percent of Population with Access'],
      'Electricity Access': ['low', 'high', 'Percent of Population with Access'],
      'Merch Exports': ['low', 'high', 'Percent of Merchandise Exports'],
      'Merch Imports': ['low', 'high', 'Percent of Merchandise Imports'],
      'Mobile Subscription': ['low', 'high', 'Subscriptions per Person'],
      CO2: ['low', 'high', 'Metric Tons per Capita']
    };

    if (this.props.indicator !== '') {
      const item = dataMinsMaxs[this.props.indicator];
      if (item) {
        selectMin = item[0];
        selectMax = item[1];
        selectUnit = item[2];
      }
    }

    return (
      <div className="map-container">
        <svg className="map">
          <g className="map__countries">
            { countries }
          </g>
          <rect
            className="gradientMap"
            height={30}
            width={600}
            x="50"
            y="350"
            stroke="#000"
          />
          <text
            className="legendText"
            x="55"
            y="375"
            style={{
              fontSize: '0.8em',
              fill: '#fff'
            }}
            >
            { selectMin }
          </text>
          <text
            className="legendText"
            x="261"
            y="375"
            style={{
              fontSize: '0.8em',
              fill: '#fff'
            }}
            >
            { selectUnit }
          </text>
          <text
            className="legendText"
            x="620"
            y="375"
            style={{
              fontSize: '0.8em'
            }}
            >
            { selectMax }
          </text>
        </svg>
      </div>
    );
  }
}

MapComponent.displayName = 'MapComponent';
export default MapComponent;
