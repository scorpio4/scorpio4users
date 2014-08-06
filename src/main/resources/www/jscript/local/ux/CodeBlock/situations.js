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
		"urn:scorpio4:iq:on:crud": [
		    ['Creating', 'urn:scorpio4:iq:on:crud:create'],
		    ['Reading', 'urn:scorpio4:iq:on:crud:create'],
		    ['Updating', 'urn:scorpio4:iq:on:crud:read'],
		    ['Deleting', 'urn:scorpio4:iq:on:crud:update'],
		    ['Created', 'urn:scorpio4:iq:on:crud:created'],
		    ['Updated', 'urn:scorpio4:iq:on:crud:updated'],
		    ['Deleted', 'urn:scorpio4:iq:on:crud:deleted'],
		    ['Exists', 'urn:scorpio4:iq:on:crud:exists'],
		    ['Locked', 'urn:scorpio4:iq:on:crud:locked'],
		    ['Un-Locked', 'urn:scorpio4:iq:on:crud:unlocked']
		], "urn:scorpio4:iq:on:service": [
			['Starting', 'urn:scorpio4:iq:on:cuebic:start'],
		    ['Stopping', 'urn:scorpio4:iq:on:application:start']
		], "urn:scorpio4:iq:on:import_export": [
			['Importing to', 'urn:scorpio4:iq:on:upload'],
		    ['Exporting from', 'urn:scorpio4:iq:on:download'],
		], "urn:scorpio4:iq:on:upload_download": [
			['Uploading', 'urn:scorpio4:iq:on:upload'],
		    ['Downloading', 'urn:scorpio4:iq:on:download'],
		], "urn:scorpio4:iq:on:email": [
			['Receiving', 'urn:scorpio4:iq:on:receiving'],
		    ['Sending', 'urn:scorpio4:iq:on:sending']
		]
	}, "attention": {
		"urn:example:model": [
			['example Project', 'urn:example:model:Project'],
			['example Activity', 'urn:example:model:Activity'],
			['example Employee', 'urn:example:model:Employee'],
			['example Company', 'urn:example:model:Company']
		],
		"urn:scorpio4:iq:applications": [
			['example', 'urn:example'],
			['Doc Tracer', 'urn:DocTracer'],
			['IQ Drive', 'urn:scorpio4:iq:Drive'],
			['CueBic', 'urn:cuebic']
		],
		"urn:scorpio4:iq:mimetypes": [
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


Blockly.Language.iq_on_crud_model = new SitationBuilder("urn:scorpio4:iq:on:crud", "urn:example:model", "model");
Blockly.Language.iq_on_service_applications = new SitationBuilder("urn:scorpio4:iq:on:service", "urn:scorpio4:iq:applications", "application");
Blockly.Language.iq_on_attachment_model = new SitationBuilder("urn:scorpio4:iq:on:import_export", "urn:example:model");
Blockly.Language.iq_on_attachment_mimes = new SitationBuilder("urn:scorpio4:iq:on:upload_download", "urn:scorpio4:iq:mimetypes", "file");
Blockly.Language.iq_on_email_attachments = new SitationBuilder("urn:scorpio4:iq:on:email", "urn:scorpio4:iq:mimetypes", "file");

