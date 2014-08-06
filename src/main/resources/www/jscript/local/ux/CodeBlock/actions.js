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
	"urn:scorpio4:iq:do:crud": [
	    ['Create', 'urn:scorpio4:iq:do:crud:create'],
	    ['Read', 'urn:scorpio4:iq:do:crud:read'],
	    ['Update', 'urn:scorpio4:iq:do:crud:update'],
	    ['Delete', 'urn:scorpio4:iq:do:crud:delete']
	],
	"urn:example:model": [
		['example Project', 'urn:example:model:Project'],
		['example Activity', 'urn:example:model:Activity'],
		['example Employee', 'urn:example:model:Employee'],
		['example Company', 'urn:example:model:Company']
	],
	"urn:scorpio4:iq:do:file": [
	    ['Upload File', 'urn:scorpio4:iq:do:file:upload'],
	    ['Download File', 'urn:scorpio4:iq:do:file::download'],
	    ['Copy File', 'urn:scorpio4:iq:do:file:copy'],
	    ['Move File', 'urn:scorpio4:iq:do:file:move'],
	    ['Delete File', 'urn:scorpio4:iq:do:file:delete'],
	], 
	"urn:scorpio4:iq:do:application": [
	    ['Run Report', 'urn:scorpio4:iq:do:report:run'],
	    ['Produce PDF', 'urn:scorpio4:iq:do:report:pdf:run']
	], 
	"urn:scorpio4:iq:do:email": [
		['Send Email', 'urn:scorpio4:iq:do:email:send'],
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

Blockly.Language.scorpio4_do_crud = new ActionBuilder("urn:scorpio4:iq:do:crud", "urn:example:model");
Blockly.Language.scorpio4_do_file = new ActionBuilder("urn:scorpio4:iq:do:file");
Blockly.Language.scorpio4_do_application = new ActionBuilder("urn:scorpio4:iq:do:application");
Blockly.Language.scorpio4_do_application = new ActionBuilder("urn:scorpio4:iq:do:email")
