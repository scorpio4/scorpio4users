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
 * distributed under the License is distributedan "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for building blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var syntax = {
	"situation": {
		"label": "when",
		"urn:factcore:iq:on:crud": [
		    ['Creating', 'urn:factcore:iq:on:crud:create'],
		    ['Reading', 'urn:factcore:iq:on:crud:create'],
		    ['Updating', 'urn:factcore:iq:on:crud:read'],
		    ['Deleting', 'urn:factcore:iq:on:crud:update'],
		    ['Created', 'urn:factcore:iq:on:crud:created'],
		    ['Updated', 'urn:factcore:iq:on:crud:updated'],
		    ['Deleted', 'urn:factcore:iq:on:crud:deleted'],
		    ['Exists', 'urn:factcore:iq:on:crud:exists'],
		    ['Locked', 'urn:factcore:iq:on:crud:locked'],
		    ['Un-Locked', 'urn:factcore:iq:on:crud:unlocked']
		], "urn:factcore:iq:on:service": [
			['Starting', 'urn:factcore:iq:on:cuebic:start'],
		    ['Stopping', 'urn:factcore:iq:on:application:start']
		], "urn:factcore:iq:on:import_export": [
			['Importing to', 'urn:factcore:iq:on:upload'],
		    ['Exporting from', 'urn:factcore:iq:on:download'],
		], "urn:factcore:iq:on:upload_download": [
			['Uploading', 'urn:factcore:iq:on:upload'],
		    ['Downloading', 'urn:factcore:iq:on:download'],
		], "urn:factcore:iq:on:email": [
			['Receiving', 'urn:factcore:iq:on:receiving'],
		    ['Sending', 'urn:factcore:iq:on:sending']
		]
	}, "attention": {
		"urn:example:model": [
			['example Project', 'urn:example:model:Project'],
			['example Activity', 'urn:example:model:Activity'],
			['example Employee', 'urn:example:model:Employee'],
			['example Company', 'urn:example:model:Company']
		],
		"urn:factcore:iq:applications": [
			['example', 'urn:example'],
			['Doc Tracer', 'urn:DocTracer'],
			['IQ Drive', 'urn:factcore:iq:Drive'],
			['CueBic', 'urn:cuebic']
		],
		"urn:factcore:iq:mimetypes": [
			['PDF', 'mime:application_pdf'],
			['M$ Excel', 'mime:application_excel'],
			['M$ Word', 'mime:application_word'],
			['M$ Project', 'xsd:application_project'],
			['Plain Text', 'xsd:plain_text'],
			['Image', 'xsd:image'],
			['N3', 'xsd:n3']
		]
	}
};
var SitationBuilder = function(situation, attention, label) {
	return {
		// Comparison operator.
		category: "Situations",
		helpUrl: "help/processor.html",
		init: function() {
			this.setColour(10);
			this.setPreviousStatement(false);
			this.setNextStatement(false);
			this.onchange = function(that, other) {
console.log("On Change: %o -> %o %o", this, that, other, Blockly.Xml.blockToDom_(this));
			}
			//    this.setOutput(true, null);
			this.appendDummyInput().appendTitle(syntax.situation.label).appendTitle(new Blockly.FieldDropdown(syntax.situation[situation]), 'situation');
			var thing = this.appendDummyInput().appendTitle(' a ').appendTitle(new Blockly.FieldDropdown(syntax.attention[attention]), 'attention');
			if (label) thing.appendTitle(label);
			this.appendStatementInput("action");
			this.setInputsInline(true);
			// Assign 'this' to a variable for use in the tooltip closure below.
			var self = this;
			this.setTooltip(function() {
			var op = self.getTitleValue('OP');
				return Blockly.Language.CodeBlock.TOOLTIPS[op];
			});
		}
	}
}


Blockly.Language.iq_on_crud_model = new SitationBuilder("urn:factcore:iq:on:crud", "urn:example:model", "model");
Blockly.Language.iq_on_service_applications = new SitationBuilder("urn:factcore:iq:on:service", "urn:factcore:iq:applications", "application");
Blockly.Language.iq_on_attachment_model = new SitationBuilder("urn:factcore:iq:on:import_export", "urn:example:model");
Blockly.Language.iq_on_attachment_mimes = new SitationBuilder("urn:factcore:iq:on:upload_download", "urn:factcore:iq:mimetypes", "file");
Blockly.Language.iq_on_email_attachments = new SitationBuilder("urn:factcore:iq:on:email", "urn:factcore:iq:mimetypes", "file");

