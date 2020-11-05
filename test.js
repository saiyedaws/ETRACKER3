var key = 'price';
var itemNumber = '352814156356';

var table_row_pattern = `tbody[id*=grid-row-${itemNumber}]`;
$row = $(table_row_pattern).first();
$row.find(`td[class*="${key}"]`).find('button[data]').click();