import React from 'react';

class FilterInput extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="filter-input-container">
        <button
          className={this.props.classes}
          id={this.props.id}
          type="radio"
          value={this.props.value}
          name="filters"
          onClick={ (e) => {
            const activeButton = document.getElementsByClassName('active')[0];
            if (activeButton) {
              activeButton.classList.remove('active');
            }

            e.target.classList.add('active');
            this.props.modifyIndicator(e.target.value);
          } }
        >
          {this.props.value}
        </button>
      </div>
    );
  }
}

class Filter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const filtersInfo = ['Sanitation', 'Death Rate',
      'Drinking Water', 'Fertility', 'Life Expectancy',
      'Labor Participation', 'Internet Access',
      'Electricity Access', 'CO2', 'Merch Exports',
      'Merch Imports', 'Mobile Subscription'];

    const filters = [];
    filtersInfo.forEach((fInfo, index) => {
      const classes = index === 0 ? 'filter-input active' : 'filter-input';
      filters.push(
        <FilterInput
          classes={classes}
          value={fInfo}
          modifyIndicator={this.props.modifyIndicator}
          />
      );
    });
    return (
      <div className="filter">
        { filters }
      </div>
    );
  }
}

export default Filter;
