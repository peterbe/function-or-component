import React, { Component } from 'react';
import Chart from 'chart.js';
import './App.css';
import Components from './Components';
import ComponentFunctions from './ComponentFunctions';
import Functions from './Functions';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';

window.timings = {};

class App extends Component {
  state = { count: 0, monkeying: false };
  incr = event => {
    window.beforeSetState = performance.now();
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };
  reset = event => {
    window.timings = {};
    this.setState({ count: 0 });
  };
  startClickMonkey = event => {
    this.setState({ monkeying: true }, () => {
      this.clickMonkey();
    });
  };

  clickMonkey = () => {
    this.interval1 = setInterval(() => {
      const links = document.querySelectorAll('a.choice:not(.active)');
      if (links.length) {
        const choice = links[Math.floor(Math.random() * links.length)];
        choice.click();
      }
    }, 2000);
    this.interval2 = setInterval(() => {
      const btn = document.querySelector('button.increment');
      if (btn) {
        btn.click();
      }
    }, 500);

    if (this.terminalTimeout) {
      clearTimeout(this.terminalTimeout);
    }
    this.terminalTimeout = setTimeout(() => {
      console.log('Forcing the stop the click monkey');
      this.stopClickMonkey(null);
    }, 60 * 1000);
    console.log('The click monkey will stop after 60 seconds.');
  };

  stopClickMonkey = event => {
    this.setState({ monkeying: false }, () => {
      this.stopMonkey();
    });
  };

  stopMonkey = () => {
    if (this.interval1) {
      clearInterval(this.interval1);
    }
    if (this.interval2) {
      clearInterval(this.interval2);
    }
  };

  render() {
    return (
      <Router>
        <div className="app">
          <header className="App-header">
            <h1 className="App-title">
              Measuring React Components Rendering Time
            </h1>
          </header>

          <div style={{ margin: 30 }}>
            <div>
              <ul>
                <li>
                  <NavLink to="/" onClick={this.reset}>
                    Reset
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="choice"
                    activeStyle={{ fontWeight: 'bold' }}
                    activeClassName="active"
                    to="/components"
                  >
                    Components
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="choice"
                    activeStyle={{ fontWeight: 'bold' }}
                    activeClassName="active"
                    to="/componentfunctions"
                  >
                    ComponentFunctions
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="choice"
                    activeStyle={{ fontWeight: 'bold' }}
                    activeClassName="active"
                    to="/functions"
                  >
                    Functions
                  </NavLink>
                </li>
              </ul>
            </div>

            <button
              className="increment"
              style={{ fontSize: '120%' }}
              type="button"
              onClick={this.incr}
            >
              Increment
            </button>

            <Route
              path="/components"
              render={() => <Components count={this.state.count} />}
            />
            <Route
              path="/componentfunctions"
              render={() => <ComponentFunctions count={this.state.count} />}
            />
            <Route
              path="/functions"
              render={() => <Functions count={this.state.count} />}
            />

            <UpdateTimings />
            <hr />
            <h3>Instructions</h3>
            <p>
              Click one of the navigation links above (but not{' '}
              <code>Reset</code>). Then click the "Increment" button.<br />
              After a while you should see a bar chart summing the <b>
                median
              </b>{' '}
              rendering times of the three different component styles.
            </p>
            <p>
              {this.state.monkeying ? (
                <button onClick={this.stopClickMonkey}>
                  Stop Click Monkey
                </button>
              ) : (
                <button onClick={this.startClickMonkey}>
                  Start Click Monkey
                </button>
              )}
            </p>
            <p>
              <small>
                Current version of React: <b>{React.version}</b> — Node Env:{' '}
                <b>{process.env.NODE_ENV}</b>
              </small>
            </p>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;

const COLORS = {
  blue: 'rgb(54, 162, 235)',
  green: 'rgb(75, 192, 192)',
  orange: 'rgb(255, 159, 64)',
  purple: 'rgb(153, 102, 255)',
  red: 'rgb(255, 99, 132)',
  yellow: 'rgb(255, 205, 86)'
};

class UpdateTimings extends React.Component {
  state = { timings: null };
  componentDidMount() {
    setInterval(() => {
      if (Object.keys(window.timings).length) {
        this.setState({ timings: window.timings }, () => {
          const datasets = [];

          const colorNames = Object.keys(COLORS);
          const labels = Object.keys(this.state.timings);
          labels.sort();
          labels.forEach((label, i) => {
            const v = this.state.timings[label];
            const color = COLORS[colorNames[i]];
            v.sort((a, b) => a - b);
            const median = (v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2;
            datasets.push({
              label: label,
              data: [median],
              backgroundColor: color,
              borderColor: color,
              fill: false
            });
          });

          const config = {
            type: 'bar',
            data: {
              datasets: datasets
            },
            options: {
              animation: {
                duration: 0
              },
              responsive: true,
              title: {
                display: true,
                text: 'Timings'
              },
              tooltips: {
                mode: 'index',
                intersect: false
              },
              hover: {
                mode: 'nearest',
                intersect: true
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true
                    }
                  }
                ]
              }
            }
          };
          const ctx = document.getElementById('chart');
          if (this.lineChart) {
            this.lineChart.destroy();
          }
          this.lineChart = new Chart(ctx, config);
        });
      }
    }, 4000);
  }
  render() {
    if (this.state.timings === null) {
      return null;
    }
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Measurements</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Min</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.state.timings).map(label => {
              const v = this.state.timings[label];
              const sum = v.reduce((a, b) => a + b);
              const mean = sum / v.length;
              v.sort((a, b) => a - b);
              const median = (v[(v.length - 1) >> 1] + v[v.length >> 1]) / 2;

              return (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{v.length}</td>
                  <td>{mean.toFixed(2)}ms</td>
                  <td>{median.toFixed(2)}ms</td>
                  <td>{v[0].toFixed(2)}ms</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>
          <small>
            <b>Tip!</b>
            Focus on the median, not the mean.
          </small>
        </p>
        <div style={{ width: '50%' }}>
          <canvas id="chart" width="400" height="400" />
        </div>
      </div>
    );
  }
}
