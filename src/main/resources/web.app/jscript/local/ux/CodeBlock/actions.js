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
 * @fileoverview Blocks for building blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var action_syntax = {
	"urn:factcore:iq:do:crud": [
	    ['Create', 'urn:factcore:iq:do:crud:create'],
	    ['Read', 'urn:factcore:iq:do:crud:read'],
	    ['Update', 'urn:factcore:iq:do:crud:update'],
	    ['Delete', 'urn:factcore:iq:do:crud:delete']
	],
	"urn:example:model": [
		['example Project', 'urn:example:model:Project'],
		['example Activity', 'urn:example:model:Activity'],
		['example Employee', 'urn:example:model:Employee'],
		['example Company', 'urn:example:model:Company']
	],
	"urn:factcore:iq:do:file": [
	    ['Upload File', 'urn:factcore:iq:do:file:upload'],
	    ['Download File', 'urn:factcore:iq:do:file::download'],
	    ['Copy File', 'urn:factcore:iq:do:file:copy'],
	    ['Move File', 'urn:factcore:iq:do:file:move'],
	    ['Delete File', 'urn:factcore:iq:do:file:delete'],
	], 
	"urn:factcore:iq:do:application": [
	    ['Run Report', 'urn:factcore:iq:do:report:run'],
	    ['Produce PDF', 'urn:factcore:iq:do:report:pdf:run']
	], 
	"urn:factcore:iq:do:email": [
		['Send Email', 'urn:factcore:iq:do:email:send'],
	]
};

var ActionBuilder = function(action, subject) {
	return {
	  // Comparison operator.
	  category: "Actions",
	  helpUrl: "help/processor/to/sql.html",
	  init: function() {
	    this.setColour(120);
	    this.setPreviousStatement(true);
	    this.setNextStatement(true);
		this.setInputsInline(true);
	//    this.setOutput(true, null);
	    this.appendDummyInput().appendTitle('do').appendTitle(new Blockly.FieldDropdown(action_syntax[action]), 'action');
		if (subject) {
		    this.appendDummyInput().appendTitle('a').appendTitle(new Blockly.FieldDropdown(action_syntax[subject]), 'subject')
		    this.appendValueInput().appendTitle('with')
		}	
	
	    // Assign 'this' to a variable for use in the tooltip closure below.
	    var thisBlock = this;
	    this.setTooltip(function() {
	      var op = thisBlock.getTitleValue('OP');
	      return Blockly.Language.ActionBuilder && Blockly.Language.ActionBuilder.TOOLTIPS && Blockly.Language.ActionBuilder.TOOLTIPS[op] || op;
	    });
	  }
	}
};

Blockly.Language.factcore_do_crud = new ActionBuilder("urn:factcore:iq:do:crud", "urn:example:model");
Blockly.Language.factcore_do_file = new ActionBuilder("urn:factcore:iq:do:file");
Blockly.Language.factcore_do_application = new ActionBuilder("urn:factcore:iq:do:application");
Blockly.Language.factcore_do_application = new ActionBuilder("urn:factcore:iq:do:email")
