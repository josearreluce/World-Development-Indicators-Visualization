import React from 'react';
import {line} from 'd3-shape';
import {buildGridColormap, drawPath} from './utils';
import {select} from 'd3-selection';

class Square extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const countries = this.props.data.countries.map(d => d.country);
    const numCountries = countries.length;
    const squareSideLength = 22;
    return (
      <rect
        x={(this.props.index + 1.3) * squareSideLength}
        y={50 + (this.props.rowIndex) * squareSideLength}
        width={squareSideLength}
        height={squareSideLength}
        stroke="#000"
        fill={this.props.scale(numCountries)}
        data-countries={countries}
        data-num-countries={numCountries}
        data-distribution={this.props.data.distr}
        onClick={this.props.handleClick}
        />
    );
  }
}

class Row extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const squareSideLength = 22;
    const squares = [];
    const timeLabel = (
      <text
        x="6"
        y={squareSideLength * (this.props.index) + 65}
        style={{fontSize: '0.6em', fontWeight: 'bold'}}
        >
        {this.props.year}
      </text>);
    const xLabels = [];

    const stats = this.props.data.stats;
    const maxDist = this.props.maxDist > 20 ? 19 : this.props.maxDist;
    const ranges = Array.from(new Array(maxDist - this.props.minDist + 1),
      (d, i) => i + this.props.minDist);
    const fullStats = [];
    ranges.forEach((n) => {
      fullStats.push({distr: n, countries: []});
    });

    stats.forEach((s) => {
      fullStats.forEach((n) => {
        if (n.distr === Number(s.distr)) {
          n.countries = s.countries;
        }
      });
    });

    fullStats.forEach((d, i) => {
      squares.push(
        <Square
          data={d}
          index={i}
          rowIndex={this.props.index}
          scale={this.props.scale}
          key={`${this.props.indicator}-row-${this.props.index}-square-${i}`}
          handleClick={this.props.handleClick}
          />
      );
    });

    return (
      <g>
        { timeLabel }
        { xLabels }
        { squares }
      </g>
    );
  }
}

class GridView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const indicator = this.props.indicator;
    const processedData = indicator ? this.props.processedData[indicator].data : [];
    const currentLabels = indicator ? this.props.processedData[indicator].labels : [];

    const rows = [];
    let years = [];
    let maxDist = -Infinity;
    if (processedData) {
      years = processedData.map(d => d.year);
      // let maxDist = -Infinity;
      let minDist = Infinity;
      let maxNum = -Infinity;
      let minNum = Infinity;
      processedData.forEach((d) => {
        d.stats.forEach((s) => {
          maxDist = Math.max(maxDist, Number(s.distr));
          minDist = Math.min(minDist, Number(s.distr));
          maxNum = Math.max(maxNum, s.countries.length);
          minNum = Math.min(minNum, s.countries.length);
        });
      });

      const colorScale = buildGridColormap(minNum, maxNum, maxDist);
      processedData.forEach((d, i) => {
        rows.push(
          <Row
            data={d}
            index={i}
            scale={colorScale}
            maxDist={maxDist}
            minDist={minDist}
            indicator={indicator}
            key={`${indicator}-${i}`}
            year={years[i]}
            handleClick={this.props.handleClick}
            />
        );
      });
    }

    const squareSideLength = 22;
    const xLabels = [];
    currentLabels.forEach((label, index) => {
      xLabels.push(
        <g>
          <text
            key={`distr-label-${index}`}
            className="label-distribution"
            x={(index + 1) * squareSideLength}
            y="15"
            style={{
              fontSize: '0.5em',
              transformOrigin: `${(index + 1) * squareSideLength}px 15px`,
              transform: 'rotate(-30deg) translateX(5px) translateY(30px)'
            }}
          >
            { label }
          </text>
          <line
          x1={(index + 1) * squareSideLength + (squareSideLength / 1.5) + 5}
          y1="40"
          x2={(index + 1) * squareSideLength + (squareSideLength / 1.5) + 5}
          y2="50"
          style={{
            stroke: '#000',
            strokeWidth: '1px'
          }}
          />
        </g>
        );
    });

    const lines = drawPath(processedData, this.props.country, maxDist);

    xLabels.forEach(d => {
      // need to do something like this
      const thePath = [{x: 0, y: 0}, {x: 10, y: 50}];
      const lineEval = line().x(p => p.x + xLabels.indexOf(d) *
        squareSideLength).y(p => p);
      select('.vis-container')
        .enter().append('path')
        .attr('class', 'label-line')
        .attr('stroke', '#000')
        .attr('stroke-width', '2')
        .attr('fill', 'none')
        .attr('d', lineEval(thePath));
    });

    return (
      <svg
        className="grid"
        height={1500}
        width={400}
        >
        <g>
          { xLabels }
        </g>
        { rows }
        { lines }
      </svg>
    );
  }
}

GridView.displayName = 'GridView';
export default GridView;
