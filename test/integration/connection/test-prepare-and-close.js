var common     = require('../../common');
var connection = common.createConnection();
var assert     = require('assert');

// usually default MAX_PREPARED_STATEMENTS on server is 16384
// check close() actually works by preparing more then MAX
// (connection has only one prepared ata a time)
var max = 170;
var start = process.hrtime();
function prepare(i) {
  connection.prepare('select 1+' + i, function(err, stmt) {
    stmt.close();
    if (!err) {
      if (i > max) {
        var end = process.hrtime(start);
        var ns = end[0]*1e9+end[1];
        console.log(max*1e9/ns + ' prepares/sec');
        return connection.end();
      }
      setTimeout(function() {prepare(i+1)}, 2);
    }
    assert(0, 'Error in prepare!');
  });
}
connection.query('SET GLOBAL max_prepared_stmt_count=10', function(err) {
  if (err) throw err;
  prepare(1);
});
