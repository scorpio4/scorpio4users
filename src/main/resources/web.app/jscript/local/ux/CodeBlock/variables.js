/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Language.variables');

goog.require('Blockly.Language');

var models = {
	"urn:example:model:Project": {
		"label": "example Project",
		"values": [
		    ['Code', 'urn:example:model:Project#code'],
		    ['Name', 'urn:example:model:Project#name'],
		    ['Site', 'urn:example:model:Project#site'],
		    ['Project Manager', 'urn:example:model:Project#manager']
		]
	},
	"urn:example:model:Employee": {
		"label": "example Employee",
		"values": [
		    ['Code', 'urn:example:model:Employee#code'],
		    ['Firstname', 'urn:example:model:Employee#firstname'],
		    ['Lastname', 'urn:example:model:Employee#lastname'],
		]
	}
}

Blockly.Language.variables_get = {
  // Variable getter.
  category: "Facts",  // Variables are handled specially.
  helpUrl: Blockly.LANG_VARIABLES_GET_HELPURL,
  init: function() {
    this.setColour(330);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldVariable(
        Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setOutput(true, null);
    this.setTooltip(Blockly.LANG_VARIABLES_GET_TOOLTIP);
  },
  getVars: function() {
    return [this.getTitleValue('VAR')];
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.setTitleValue(newName, 'VAR');
    }
  }
};


Blockly.Language.variables_set = {
  // Variable setter.
  category: "Facts",  // Variables are handled specially.
  helpUrl: "variable/help.html",
  init: function() {
    this.setColour(330);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.LANG_VARIABLES_SET_TITLE)
        .appendTitle(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_SET_ITEM), 'VAR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.LANG_VARIABLES_SET_TOOLTIP);
  },
  getVars: function() {
    return [this.getTitleValue('VAR')];
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.setTitleValue(newName, 'VAR');
    }
  }
};

Blockly.Language.variables_use = {
  // Variable getter.
  category: "Facts",  // Variables are handled specially.
  helpUrl: Blockly.LANG_VARIABLES_GET_HELPURL,
  init: function() {
    this.setColour(330);
    this.appendDummyInput().appendTitle(new Blockly.FieldDropdown(models["urn:example:model:Project"].values), 'VAR');
    this.setOutput(true, null);
    this.setTooltip(Blockly.LANG_VARIABLES_GET_TOOLTIP);
  },
  getVars: function() {
    return [this.getTitleValue('VAR')];
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getTitleValue('VAR'))) {
      this.setTitleValue(newName, 'VAR');
    }
  }
};


Blockly.Language.variables_assign = {
  // Variable setter.
  category: "Facts",
  helpUrl: "variable/help.html",
  init: function() {
    this.setColour(330);
	this.setInputsInline(true);
    this.appendDummyInput()
    .appendTitle(new Blockly.FieldDropdown(models["urn:example:model:Project"].values), 'VAR');
    this.appendDummyInput('VALUE').appendTitle("=")
    .appendTitle(new Blockly.FieldTextInput('unknown'), 'VALUE');

//    this.setPreviousStatement(true);
//    this.setNextStatement(true);
	this.setOutput(true, null);

//    this.setTooltip(Blockly.LANG_VARIABLES_SET_TOOLTIP);
  }
};

Blockly.Language.variables_model = {
  // Variable setter.
  category: "Facts",
  helpUrl: "variable/help.html",
  init: function() {
    this.setColour(330);
	this.setInputsInline(true);
	var values = new Array();
	for(var model in models) {
		values.push( [ models[model].label, model ] );
	}
	this.appendValueInput().appendTitle("model").appendTitle(new Blockly.FieldDropdown(values), 'VAR');
	this.setOutput(true, null);
    this.setMutator(new Blockly.Mutator(['variables_use']));

//    this.setPreviousStatement(true);
//    this.setNextStatement(true);
//    this.setTooltip(Blockly.LANG_VARIABLES_SET_TOOLTIP);
  },
  domToMutation: function(xmlElement) {
  	alert("dom2");
  },
  mutationToDom: function(xmlElement) {
  	console.log("2dom: %s",xmlElement);
      return null;
  },
  compose: function(workspace) {
  	console.log("compose: %s",workspace);
  	alert("compose");
  },
  decompose: function(workspace) {
  	console.log("decompose: %s",workspace);
  	alert("decompose");
  	var block = new Blockly.Language.variables_use(workspace, 'variables_use');
  	return block;
  }
};


