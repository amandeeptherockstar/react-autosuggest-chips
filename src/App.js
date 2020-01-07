import React from "react";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import ChipInput from "material-ui-chip-input";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";

function renderInput(inputProps) {
  const { value, onChange, chips, ref, ...other } = inputProps;

  return (
    <ChipInput
      clearInputValueOnChange
      onUpdateInput={onChange}
      value={chips}
      inputRef={ref}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.name, query);
  const parts = parse(suggestion.name, matches);

  return (
    <MenuItem
      selected={isHighlighted}
      component="div"
      onMouseDown={e => e.preventDefault()} // prevent the click causing the input to be blurred
    >
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <span key={String(index)}>{part.text}</span>
          );
        })}
      </div>
    </MenuItem>
  );
}

function renderSuggestionsContainer(options) {
  const { containerProps, children } = options;
  return (
    <Paper
      elevation={0}
      {...containerProps}
      style={{
        maxHeight: children && children.props.items.length > 0 ? 400 : 0,
        overflow: "auto"
      }}
      square
    >
      {children}
    </Paper>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    // height: "400px",
    // overflow: "auto",
    position: "absolute"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(3),
    left: 0,
    right: 0,
    zIndex: 1
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  textField: {
    width: "100%"
  }
});

class App extends React.Component {
  state = {
    // value: '',
    suggestions: [],
    value: [],
    textFieldInput: ""
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    fetch(`https://restcountries.eu/rest/v2/name/${value}`)
      .then(resp => resp.json())
      .then(response => {
        const countries =
          Array.isArray(response) &&
          response.map(country => ({
            name: country.name
          }));
        console.log(countries, "countries");
        this.setState({ suggestions: countries || [] });
      });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handletextFieldInputChange = (event, { newValue }) => {
    this.setState({
      textFieldInput: newValue
    });
  };

  handleAddChip(chip) {
    this.setState({ value: this.state.value.concat([chip]) }, () =>
      console.log(this.state.value)
    );
  }

  handleDeleteChip(chip, index) {
    const temp = this.state.value;
    temp.splice(index, 1);
    this.setState({ value: temp });
  }

  handlePaste = e => {
    const dt = e.clipboardData.getData("Text").split(" ");
    console.log(dt, "dt");
    this.setState(prevState => {
      console.log(prevState.value, "value");
      return {
        textFieldInput: "",
        value: [...prevState.value, ...dt]
      };
    });
  };

  render() {
    const { classes, ...rest } = this.props;

    return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion
        }}
        renderInputComponent={renderInput}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={(e, { suggestionValue }) => {
          this.handleAddChip(suggestionValue);
          e.preventDefault();
        }}
        focusInputOnSuggestionClick
        inputProps={{
          // classes,
          chips: this.state.value,
          onChange: this.handletextFieldInputChange,
          onPaste: this.handlePaste,
          value: this.state.textFieldInput,
          onAdd: chip => this.handleAddChip(chip),
          onDelete: (chip, index) => this.handleDeleteChip(chip, index),
          ...rest
        }}
      />
    );
  }
}

export default withStyles(styles)(App);
