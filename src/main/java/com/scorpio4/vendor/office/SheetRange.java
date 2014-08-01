package com.scorpio4.vendor.office;
/*
 *   Fact:Core - CONFIDENTIAL
 *   Unpublished Copyright (c) 2009-2014 Lee Curtis, All Rights Reserved.
 *
 *   NOTICE:  All information contained herein is, and remains the property of Lee Curtis. The intellectual and technical concepts contained
 *   herein are proprietary to Lee Curtis and may be covered by Australian, U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 *   Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 *   from Lee Curtis.  Access to the source code contained herein is hereby forbidden to anyone except current Lee Curtis employees, managers or contractors who have executed
 *   Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 *   The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 *   information that is confidential and/or proprietary, and is a trade secret, of Lee Curtis.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 *   OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF LEE CURTIS IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 *   LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 *   TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 */

import com.scorpio4.util.string.PrettyString;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.AreaReference;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * User: lee
 * Date: 8/08/12
 * Time: 11:21 PM
 *
 * Simple header class to quickly create spreadsheets holding tablular data, identified by named-ranges
 */

public class SheetRange {
	private static final org.slf4j.Logger log = LoggerFactory.getLogger(SheetRange.class);

	Map styles = new HashMap();
	Workbook workbook = null;

	public SheetRange() {
		init(false);
		createStyles();
	}

	public SheetRange(String name, List headers, List rows) throws IOException {
		init(false);
		createStyles();
		create(name, headers, rows);
	}

	public SheetRange(String name, List headers, List rows, File file) throws IOException {
		init(file.getName().endsWith("xls"));
		createStyles();
		create(name, headers, rows);
		save(file);
	}

	public void init(boolean xls) {
		if (xls) createXLS();
		else createXLSX();
	}
	
	public Workbook createXLS() {
		return workbook = new HSSFWorkbook();
	}

	public Workbook createXLSX() {
		return workbook = new XSSFWorkbook();
	}

	public Sheet createSheet(String name) {
		Sheet sheet = workbook.createSheet(name);
		sheet.setDisplayGridlines(false);
		sheet.setPrintGridlines(false);
		sheet.setFitToPage(true);
		sheet.setHorizontallyCenter(true);
		PrintSetup printSetup = sheet.getPrintSetup();
		printSetup.setLandscape(true);

		if (workbook instanceof HSSFWorkbook) {
			sheet.setAutobreaks(true);
			printSetup.setFitHeight((short)1);
			printSetup.setFitWidth((short)1);
		}
		return sheet;
	}

	public Sheet create(String name, List headers, List rows) {
		return add( createSheet(name), headers, rows);
	}

	public Sheet add(Sheet sheet, List headers, List rows) {
		addHeader(sheet, headers);
		add(sheet, rows);
		autoSizeColumns(sheet, headers.size());
		int total_rows = (rows.size()-1)+(headers.isEmpty()?0:1);
		int total_cols = headers.size()-1;
		createNamedRange(sheet, sheet.getSheetName(), 0, 0, total_cols, total_rows);
		return sheet;
	}

	public void autoSizeColumns(Sheet sheet, int cols) {
		for(int i=0;i<cols;i++) sheet.autoSizeColumn(i);
	}

	public void addHeader(Sheet sheet, List headers) {
		Row headerRow = sheet.createRow(0);
		headerRow.setHeightInPoints(12.75f);
		for (int i=0;i<headers.size();i++) {
			Cell cell = headerRow.createCell(i);
			String header = (String)headers.get(i);
			cell.setCellValue(header);
			setStyle(cell, "header");
		}
	}

	public void add(Sheet sheet, List rows) {
		for (int i = 0; i < rows.size(); i++) {
			Row row = sheet.createRow(1+i);
			List columns = (List)rows.get(i);
			add(row, columns);
		}
	}

	public void add(Row row, List columns) {
		for (int i=0; i<columns.size();i++ ) {
			Object column =  columns.get(i);
			add(row, i, column);
		}
	}

	public void add(Row row, int col, Object column) {
		Cell cell = row.createCell(col);
		if (column != null) {
			cell.setCellValue(column.toString());
			setStyle(cell, "normal");
		} else {
			setStyle(cell, "error");
		}
	}

	public void save(File file) throws IOException {
		file.getParentFile().mkdirs();
		save(new FileOutputStream(file));
	}

	public void save(OutputStream file) throws IOException {
		try {
			workbook.write(file);
		} catch(IOException ioe) {
			throw new IOException(ioe.getMessage(), ioe);
		} finally {
			file.close();
		}
	}

	public void setStyle(Cell cell, String stylename) {
		CellStyle style = (CellStyle) styles.get(stylename);
		if (style==null) return;
		cell.setCellStyle(style);
	}

	public void createStyles() {
		addStyle("header", createHeaderStyle() );
		addStyle("normal", createNormalStyle() );
		addStyle("error", createErrorStyle() );
	}

	public void addStyle(String name, CellStyle style) {
		styles.put(name, style );
	}

	public CellStyle createHeaderStyle() {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style.setAlignment(CellStyle.ALIGN_CENTER);
		style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
		style.setFillPattern(CellStyle.SOLID_FOREGROUND);
		style.setFont(font);
		return style;
	}

	public CellStyle createErrorStyle() {
		CellStyle style = createNormalStyle();
		style.setFillForegroundColor(IndexedColors.RED.getIndex());
		addBorders(style,IndexedColors.RED.getIndex());
		return style;
	}

	public CellStyle createNormalStyle() {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBoldweight(Font.BOLDWEIGHT_BOLD);
		style.setAlignment(CellStyle.ALIGN_LEFT);
		style.setFont(font);
		return style;
	}

	public void addBorders(CellStyle style) {
		addBorders(style, IndexedColors.BLACK.getIndex(), true,true,true,true);
	}

	public void addBorders(CellStyle style, short color) {
		addBorders(style, color, true,true,true,true);
	}

	public void addBorders(CellStyle style, short color, boolean top, boolean right, boolean bottom, boolean left) {
		if (right){
			style.setBorderRight(CellStyle.BORDER_THIN);
			style.setRightBorderColor(color);
		}
		if (left) {
			style.setBorderLeft(CellStyle.BORDER_THIN);
			style.setLeftBorderColor(color);
		}
		if (top) {
			style.setBorderTop(CellStyle.BORDER_THIN);
			style.setTopBorderColor(color);
		}
		if (bottom) {
			style.setBorderBottom(CellStyle.BORDER_THIN);
			style.setBottomBorderColor(color);
		}
	}

	// convenience method
	public Name createNamedRange(Sheet sheet, String name, int to_col, int to_row) {
		return createNamedRange(sheet, name, 0, 0, to_col, to_row);
	}

	public Name createNamedRange(Sheet sheet, String name, int from_col, int from_row, int to_col, int to_row) {
		Name namedRange = workbook.createName();
		name = PrettyString.wikize(name);
		namedRange.setNameName( name );
		AreaReference area = new AreaReference(new CellReference( from_row, from_col, true, true ), new CellReference( to_row, to_col, true, true ));
		String sheetName = sheet.getSheetName();
		String reference = "'"+sheetName +"'!"+ area.formatAsString(); // area reference
		log.debug("Named Range: "+reference);
		namedRange.setRefersToFormula(reference);
		return namedRange;
	}
}