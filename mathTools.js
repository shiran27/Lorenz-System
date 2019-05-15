function solveAssignmentProblem1(costMatrix){
	var N = costMatrix.length;
	
	
	var costMatrixV2 = costMatrix;//row reduction
	for(var rowID = 0; rowID<N; rowID++){
		var rowMin = min(costMatrix[rowID]); 
		//print(rowMin);
		for(var colID = 0; colID<N; colID++){
			costMatrixV2[rowID][colID] = costMatrix[rowID][colID]-rowMin; 
		}
	}
	
	var costMatrixV2T = []; //getting transpose of row reduced matrix
	for(var rowID = 0; rowID<N; rowID++){
		append(costMatrixV2T,[]);
		for(var colID = 0; colID<N; colID++){
			costMatrixV2T[rowID][colID] = costMatrixV2[colID][rowID]; 
		}
	}
	
	
	var costMatrixV3T = costMatrixV2T;//coloumn reduction
	for(var rowID = 0; rowID<N; rowID++){
		var rowMin = min(costMatrixV2T[rowID]); 
		//print(rowMin );
		for(var colID = 0; colID<N; colID++){
			costMatrixV3T[rowID][colID] = costMatrixV2T[rowID][colID]-rowMin; 
		}
	}
	
	
	var costMatrixV3 = []; //getting transpose of coloumn reduced matrix
	for(var rowID = 0; rowID<N; rowID++){ 
		append(costMatrixV3,[]);
		for(var colID = 0; colID<N; colID++){
			costMatrixV3[rowID][colID] = costMatrixV3T[colID][rowID]; 
		}
	}
	
	
	//iterative algorithm
	var optimalityReached=false;
	var assignProbIteration = 0;
	while(!optimalityReached){
		assignProbIteration++;
		
		print("Mat");
		print(costMatrixV3);
		
		
		
		
		if(assignProbIteration>50){
			print("optimality Not Reached");
			/*print("Mat");
			print(costMatrixV3);
			print("iteration");
			print(assignProbIteration);
			print("sqzeros");
			print(squaredZeros);
			print("remains");
			print(remainingRows);
			print(remainingCols);
			print("marked");
			print(markedRows);
			print(markedCols);*/
			return Array.apply(null, {length: N}).map(Number.call, Number);
			
			
		}
		
		
		//step1
		var squaredZeros=[];
		var remainingCols=Array.apply(null, {length: N}).map(Number.call, Number);
		var remainingRows=Array.apply(null, {length: N}).map(Number.call, Number);
		var markedRows = [];
		var markedCols = [];
		
		
		var totalRemainingZerosCount = 1; //for initial row and colomn scanningstart
				
		while(totalRemainingZerosCount==1){
			//row scan on costMatrixV3
			for(var rowID = 0; rowID<remainingRows.length; rowID++){
				var rowIDSearch = remainingRows[rowID];
				var zerosCount=0;
				var tempColIndex;
				for(var colID = 0; colID<remainingCols.length; colID++){
					var colIDSearch = remainingCols[colID];
					if(costMatrixV3[rowIDSearch][colIDSearch]==0){
						zerosCount++;
						tempColIndex=colIDSearch;
					} 
				}
				if(zerosCount==1){
					append(squaredZeros,[rowIDSearch,tempColIndex]);
					var indexToBeRemoved = remainingCols.indexOf(tempColIndex);
					remainingCols.splice(indexToBeRemoved, 1);
					append(markedCols,tempColIndex);
				}
			}
			//column scan on costMatrixV3
			for(var colID = 0; colID<remainingCols.length; colID++){
				var colIDSearch = remainingCols[colID];
				var zerosCount=0;
				var tempRowIndex;
				for(var rowID = 0; rowID<remainingRows.length; rowID++){
					var rowIDSearch = remainingRows[rowID];
					if(costMatrixV3[rowIDSearch][colIDSearch]==0){
						zerosCount++;
						tempRowIndex=rowIDSearch;
					} 
				}
				if(zerosCount==1){
					append(squaredZeros,[tempRowIndex,colIDSearch]);
					var indexToBeRemoved = remainingRows.indexOf(tempRowIndex);
					remainingRows.splice(indexToBeRemoved, 1);
					append(markedRows,tempRowIndex);
				}
			}
			
			//check whether remaining total uncut zeros, if 1: loop continue, if zero: loop break, if >=2: diagonal cut
			totalRemainingZerosCount = 0;
			var remainingZerosCoordinates = [];
			for(var rowID=0;rowID<remainingRows.length;rowID++){
				var rowIDSearch = remainingRows[rowID];
				for(var colID=0;colID<remainingCols.length;colID++){
					var colIDSearch = remainingCols[colID];
					if(costMatrixV3[rowIDSearch][colIDSearch]==0){
						totalRemainingZerosCount++;
						append(remainingZerosCoordinates,[rowIDSearch,colIDSearch]);
					}
				}
			}
			
			
			if(totalRemainingZerosCount==0){
				break;
			}else if(totalRemainingZerosCount>=2){
				print("multiple uncut zeros exist - more than one optimal sol");
				
				//identify diagonally placed uncut zeros
				var avoidRows = [];//diagonal zero cancelling
				var avoidCols = [];
				append(squaredZeros,remainingZerosCoordinates[0]);
				
				//cut column, avoid row
				//or cut row avoid column
				append(squaredZeros,remainingZerosCoordinates[0]);
				append(avoidRows,remainingZerosCoordinates[0][0]);
				
				if(avoidRows.length>=1){
					for(var zeroID=0; zeroID<totalRemainingZerosCount; zeroID++){
						if(remainingZerosCoordinates[zeroID][0]!=avoidRows[avoidRows.length-1]){//diagonally placed zero
							
						}
					}
				}else{
					
					var indexToBeRemoved = remainingCols.indexOf(remainingZerosCoordinates[0][1]);
					remainingCols.splice(indexToBeRemoved, 1);
					append(markedCols,remainingZerosCoordinates[0][1]);
				}
				
				//var indexToBeRemoved = remainingRows.indexOf(remainingZerosCoordinates[0][0]);
				//remainingRows.splice(indexToBeRemoved, 1);
				//append(markedRows,remainingZerosCoordinates[0][0]);
				
				print(remainingZerosCoordinates);
				
			}
			
			
		}
		//if zeros are there  even after row and colomn scaning: https://youtu.be/-0DEQmp7B9o : min19.53
		
		
		
		
		
		
		
		
		//step2
		if(squaredZeros.length!=N){
			optimalityReached = false;
			
			//step3
			
			//for undeleted entries
			var remainingCells = [];
			for(var rowID=0;rowID<remainingRows.length;rowID++){
				var rowIDSearch = remainingRows[rowID];
				for(var colID=0;colID<remainingCols.length;colID++){
					var colIDSearch = remainingCols[colID];
					if(costMatrixV3[rowIDSearch][colIDSearch]==0){
						print("bloody trouble!!!");
					}
					append(remainingCells,costMatrixV3[rowIDSearch][colIDSearch]);
				}
			}
			
			var minRemainingCellValue = min(remainingCells); 
			for(var rowID=0;rowID<remainingRows.length;rowID++){
				var rowIDSearch = remainingRows[rowID];
				for(var colID=0;colID<remainingCols.length;colID++){
					var colIDSearch = remainingCols[colID];
					costMatrixV3[rowIDSearch][colIDSearch] = costMatrixV3[rowIDSearch][colIDSearch]-minRemainingCellValue;
				} 
			}
			
			//for crossed elements
			for(var rowID=0;rowID<markedRows.length;rowID++){
				var rowIDSearch = markedRows[rowID];
				for(var colID=0;colID<markedCols.length;colID++){
					var colIDSearch = markedCols[colID];
					costMatrixV3[rowIDSearch][colIDSearch] = costMatrixV3[rowIDSearch][colIDSearch]+minRemainingCellValue;
				} 
			}
			
			
		}
		else{
			optimalityReached = true;
			result=Array.apply(null, {length: N}).map(Number.call, Number);//ith element=who is going to take ith job
			for(var i=0;i<N;i++){
				result[squaredZeros[i][0]]=squaredZeros[i][1];
			}
			return result
			//out the results using squaredZeros
		}
		
		print("iteration");
		print(assignProbIteration);
		print("sqzeros");
		print(squaredZeros);
		print("remains");
		print(remainingRows);
		print(remainingCols);
		print("marked");
		print(markedRows);
		print(markedCols);
		
		
		/*print("Mat");
		print(costMatrixV3);
		print("iteration");
		print(assignProbIteration);
		print("sqzeros");
		print(squaredZeros);
		print("remains");
		print(remainingRows);
		print(remainingCols);
		print("marked");
		print(markedRows);
		print(markedCols);*/
	}

	//return costMatrixV3;
	
	
}

//costMatrix = [[9,11,14,11,7],[6,15,13,13,10],[12,13,6,8,8],[11,9,10,12,9],[7,12,14,10,14]];
//costMatrix = [[90,75,75,80],[35,85,55,65],[125,95,90,105],[45,110,95,115]];
//costMatrix = [[250,400,350],[400,600,350],[200,400,250]];

/*costMatrix =  [[27.227603134868946, 249.8025139467172, 466.91115236972763, 314.2975840552035, 151.38640699227054, 375.61763971292135, 350.5228243785919], 
	[248.94542292990332, 57.68460589312442, 226.1730017779681, 236.63285174987863, 203.74126988184474, 175.06884985825025, 276.53249466138675],
	[458.6561955671582, 220.60827746711342, 38.56499383082747, 349.61507571520724, 383.48056907590393, 154.92690409453974, 346.43854846242135],
	[286.99684796519443, 156.45727229896923, 320.28799254192415, 23.597012433952724, 363.0204093331636, 374.30713738464635, 486.68727266069146],
	[286.05596012810565, 270.95027198613855, 371.39142838758636, 438.67671307123317, 112.20109993312073, 195.02081225305824, 89.4920883693505],
	[412.9748089806102, 358.5425848745763, 386.17135452417443, 536.5916669209697, 238.3640042529678, 194.02027088916617, 38.21065305562695],
	[431.6334268596361, 395.31732531096065, 427.1613537310061, 572.0305353662685, 254.592415355589, 235.17777425211787, 62.49660117020377]];*/

/*costMatrix = [[210, 446, 446, 595],
	[196, 433, 433, 580],
	[182, 421, 420, 566],
	[168, 408, 408, 552]];*/

/*costMatrix = [[210.97811537678214, 446.45858759544024, 446.33321824698595, 595.0469871743263],
	[196.8359852556315, 433.7360572429742, 433.6074760850126, 580.9048515584799],
	[182.69385598637837, 421.10410146143886, 420.97214269226646, 566.7627159430269],
	[168.5517277834551, 408.5711213272555, 408.4356087916688, 552.6205803279976]];*/


/*costMatrix = [[53, 312, 259, 152, 341, 409],[301, 67, 396, 138, 328, 253],[315, 424, 75, 235, 122, 302],[427, 283, 335, 230, 161, 40],[585, 415, 449, 390, 252, 134],[571, 403, 437, 376, 240, 120]];*/


/*costMatrix = [[37, 354, 157, 170, 348, 372, 358, 502],[353, 28, 369, 166, 497, 167, 361, 359],[323, 483, 134, 339, 58, 370, 183, 374],[235, 231, 171, 109, 299, 174, 203, 306],[429, 399, 265, 337, 210, 225, 36, 162],[505, 328, 387, 355, 380, 141, 195, 52],[585, 412, 452, 442, 411, 229, 236, 49],[571, 401, 439, 428, 400, 217, 224, 35]];
*/

/*costMatrix = [[232, 446, 576],[218, 433, 561],[204, 420, 547]]*/

























var MAX_SIZE = parseInt(Number.MAX_SAFE_INTEGER/2) || ((1 << 26)*(1 << 26));

/**
 * A default value to pad the cost matrix with if it is not quadratic.
 */
var DEFAULT_PAD_VALUE = 0;

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/**
 * Calculate the Munkres solution to the classical assignment problem.
 * See the module documentation for usage.
 * @constructor
 */
function Munkres() {
  this.C = null;

  this.row_covered = [];
  this.col_covered = [];
  this.n = 0;
  this.Z0_r = 0;
  this.Z0_c = 0;
  this.marked = null;
  this.path = null;
}

/**
 * Pad a possibly non-square matrix to make it square.
 *
 * @param {Array} matrix An array of arrays containing the matrix cells
 * @param {Number} [pad_value] The value used to pad a rectangular matrix
 *
 * @return {Array} An array of arrays representing the padded matrix
 */
Munkres.prototype.pad_matrix = function(matrix, pad_value) {
  pad_value = pad_value || DEFAULT_PAD_VALUE;

  var max_columns = 0;
  var total_rows = matrix.length;
  var i;

  for (i = 0; i < total_rows; ++i)
    if (matrix[i].length > max_columns)
      max_columns = matrix[i].length;

  total_rows = max_columns > total_rows ? max_columns : total_rows;

  var new_matrix = [];

  for (i = 0; i < total_rows; ++i) {
    var row = matrix[i] || [];
    var new_row = row.slice();

    // If this row is too short, pad it
    while (total_rows > new_row.length)
      new_row.push(pad_value);

    new_matrix.push(new_row);
  }

  return new_matrix;
};

/**
 * Compute the indices for the lowest-cost pairings between rows and columns
 * in the database. Returns a list of (row, column) tuples that can be used
 * to traverse the matrix.
 *
 * **WARNING**: This code handles square and rectangular matrices.
 * It does *not* handle irregular matrices.
 *
 * @param {Array} cost_matrix The cost matrix. If this cost matrix is not square,
 *                            it will be padded with DEFAULT_PAD_VALUE. Optionally,
 *                            the pad value can be specified via options.padValue.
 *                            This method does *not* modify the caller's matrix.
 *                            It operates on a copy of the matrix.
 * @param {Object} [options] Additional options to pass in
 * @param {Number} [options.padValue] The value to use to pad a rectangular cost_matrix
 *
 * @return {Array} An array of ``(row, column)`` arrays that describe the lowest
 *                 cost path through the matrix
 */
Munkres.prototype.compute = function(cost_matrix, options) {

  options = options || {};
  options.padValue = options.padValue || DEFAULT_PAD_VALUE;

  this.C = this.pad_matrix(cost_matrix, options.padValue);
  this.n = this.C.length;
  this.original_length = cost_matrix.length;
  this.original_width = cost_matrix[0].length;

  var nfalseArray = []; /* array of n false values */
  while (nfalseArray.length < this.n)
    nfalseArray.push(false);
  this.row_covered = nfalseArray.slice();
  this.col_covered = nfalseArray.slice();
  this.Z0_r = 0;
  this.Z0_c = 0;
  this.path =   this.__make_matrix(this.n * 2, 0);
  this.marked = this.__make_matrix(this.n, 0);

  var step = 1;

  var steps = { 1 : this.__step1,
                2 : this.__step2,
                3 : this.__step3,
                4 : this.__step4,
                5 : this.__step5,
                6 : this.__step6 };

  while (true) {
    var func = steps[step];
    if (!func) // done
      break;

    step = func.apply(this);
  }

  var results = [];
  for (var i = 0; i < this.original_length; ++i)
    for (var j = 0; j < this.original_width; ++j)
      if (this.marked[i][j] == 1)
        results.push([i, j]);

  return results;
};

/**
 * Create an n×n matrix, populating it with the specific value.
 *
 * @param {Number} n Matrix dimensions
 * @param {Number} val Value to populate the matrix with
 *
 * @return {Array} An array of arrays representing the newly created matrix
 */
Munkres.prototype.__make_matrix = function(n, val) {
  var matrix = [];
  for (var i = 0; i < n; ++i) {
    matrix[i] = [];
    for (var j = 0; j < n; ++j)
      matrix[i][j] = val;
  }

  return matrix;
};

/**
 * For each row of the matrix, find the smallest element and
 * subtract it from every element in its row. Go to Step 2.
 */
Munkres.prototype.__step1 = function() {
  for (var i = 0; i < this.n; ++i) {
    // Find the minimum value for this row and subtract that minimum
    // from every element in the row.
    var minval = Math.min.apply(Math, this.C[i]);

    for (var j = 0; j < this.n; ++j)
      this.C[i][j] -= minval;
  }

  return 2;
};

/**
 * Find a zero (Z) in the resulting matrix. If there is no starred
 * zero in its row or column, star Z. Repeat for each element in the
 * matrix. Go to Step 3.
 */
Munkres.prototype.__step2 = function() {
  for (var i = 0; i < this.n; ++i) {
    for (var j = 0; j < this.n; ++j) {
      if (this.C[i][j] === 0 &&
        !this.col_covered[j] &&
        !this.row_covered[i])
      {
        this.marked[i][j] = 1;
        this.col_covered[j] = true;
        this.row_covered[i] = true;
        break;
      }
    }
  }

  this.__clear_covers();

  return 3;
};

/**
 * Cover each column containing a starred zero. If K columns are
 * covered, the starred zeros describe a complete set of unique
 * assignments. In this case, Go to DONE, otherwise, Go to Step 4.
 */
Munkres.prototype.__step3 = function() {
  var count = 0;

  for (var i = 0; i < this.n; ++i) {
    for (var j = 0; j < this.n; ++j) {
      if (this.marked[i][j] == 1 && this.col_covered[j] == false) {
        this.col_covered[j] = true;
        ++count;
      }
    }
  }

  return (count >= this.n) ? 7 : 4;
};

/**
 * Find a noncovered zero and prime it. If there is no starred zero
 * in the row containing this primed zero, Go to Step 5. Otherwise,
 * cover this row and uncover the column containing the starred
 * zero. Continue in this manner until there are no uncovered zeros
 * left. Save the smallest uncovered value and Go to Step 6.
 */

Munkres.prototype.__step4 = function() {
  var done = false;
  var row = -1, col = -1, star_col = -1;

  while (!done) {
    var z = this.__find_a_zero();
    row = z[0];
    col = z[1];

    if (row < 0)
      return 6;

    this.marked[row][col] = 2;
    star_col = this.__find_star_in_row(row);
    if (star_col >= 0) {
      col = star_col;
      this.row_covered[row] = true;
      this.col_covered[col] = false;
    } else {
      this.Z0_r = row;
      this.Z0_c = col;
      return 5;
    }
  }
};

/**
 * Construct a series of alternating primed and starred zeros as
 * follows. Let Z0 represent the uncovered primed zero found in Step 4.
 * Let Z1 denote the starred zero in the column of Z0 (if any).
 * Let Z2 denote the primed zero in the row of Z1 (there will always
 * be one). Continue until the series terminates at a primed zero
 * that has no starred zero in its column. Unstar each starred zero
 * of the series, star each primed zero of the series, erase all
 * primes and uncover every line in the matrix. Return to Step 3
 */
Munkres.prototype.__step5 = function() {
  var count = 0;

  this.path[count][0] = this.Z0_r;
  this.path[count][1] = this.Z0_c;
  var done = false;

  while (!done) {
    var row = this.__find_star_in_col(this.path[count][1]);
    if (row >= 0) {
      count++;
      this.path[count][0] = row;
      this.path[count][1] = this.path[count-1][1];
    } else {
      done = true;
    }

    if (!done) {
      var col = this.__find_prime_in_row(this.path[count][0]);
      count++;
      this.path[count][0] = this.path[count-1][0];
      this.path[count][1] = col;
    }
  }

  this.__convert_path(this.path, count);
  this.__clear_covers();
  this.__erase_primes();
  return 3;
};

/**
 * Add the value found in Step 4 to every element of each covered
 * row, and subtract it from every element of each uncovered column.
 * Return to Step 4 without altering any stars, primes, or covered
 * lines.
 */
Munkres.prototype.__step6 = function() {
  var minval = this.__find_smallest();

  for (var i = 0; i < this.n; ++i) {
    for (var j = 0; j < this.n; ++j) {
      if (this.row_covered[i])
        this.C[i][j] += minval;
      if (!this.col_covered[j])
        this.C[i][j] -= minval;
    }
  }

  return 4;
};

/**
 * Find the smallest uncovered value in the matrix.
 *
 * @return {Number} The smallest uncovered value, or MAX_SIZE if no value was found
 */
Munkres.prototype.__find_smallest = function() {
  var minval = MAX_SIZE;

  for (var i = 0; i < this.n; ++i)
    for (var j = 0; j < this.n; ++j)
      if (!this.row_covered[i] && !this.col_covered[j])
        if (minval > this.C[i][j])
          minval = this.C[i][j];

  return minval;
};

/**
 * Find the first uncovered element with value 0.
 *
 * @return {Array} The indices of the found element or [-1, -1] if not found
 */
Munkres.prototype.__find_a_zero = function() {
  for (var i = 0; i < this.n; ++i)
    for (var j = 0; j < this.n; ++j)
      if (this.C[i][j] === 0 &&
        !this.row_covered[i] &&
        !this.col_covered[j])
        return [i, j];

  return [-1, -1];
};

/**
 * Find the first starred element in the specified row. Returns
 * the column index, or -1 if no starred element was found.
 *
 * @param {Number} row The index of the row to search
 * @return {Number}
 */

Munkres.prototype.__find_star_in_row = function(row) {
  for (var j = 0; j < this.n; ++j)
    if (this.marked[row][j] == 1)
      return j;

  return -1;
};

/**
 * Find the first starred element in the specified column.
 *
 * @return {Number} The row index, or -1 if no starred element was found
 */
Munkres.prototype.__find_star_in_col = function(col) {
  for (var i = 0; i < this.n; ++i)
    if (this.marked[i][col] == 1)
      return i;

  return -1;
};

/**
 * Find the first prime element in the specified row.
 *
 * @return {Number} The column index, or -1 if no prime element was found
 */

Munkres.prototype.__find_prime_in_row = function(row) {
  for (var j = 0; j < this.n; ++j)
    if (this.marked[row][j] == 2)
      return j;

  return -1;
};

Munkres.prototype.__convert_path = function(path, count) {
  for (var i = 0; i <= count; ++i)
    this.marked[path[i][0]][path[i][1]] =
      (this.marked[path[i][0]][path[i][1]] == 1) ? 0 : 1;
};

/** Clear all covered matrix cells */
Munkres.prototype.__clear_covers = function() {
  for (var i = 0; i < this.n; ++i) {
    this.row_covered[i] = false;
    this.col_covered[i] = false;
  }
};

/** Erase all prime markings */
Munkres.prototype.__erase_primes = function() {
  for (var i = 0; i < this.n; ++i)
    for (var j = 0; j < this.n; ++j)
      if (this.marked[i][j] == 2)
        this.marked[i][j] = 0;
};

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Create a cost matrix from a profit matrix by calling
 * 'inversion_function' to invert each value. The inversion
 * function must take one numeric argument (of any type) and return
 * another numeric argument which is presumed to be the cost inverse
 * of the original profit.
 *
 * This is a static method. Call it like this:
 *
 *  cost_matrix = make_cost_matrix(matrix[, inversion_func]);
 *
 * For example:
 *
 *  cost_matrix = make_cost_matrix(matrix, function(x) { return MAXIMUM - x; });
 *
 * @param {Array} profit_matrix An array of arrays representing the matrix
 *                              to convert from a profit to a cost matrix
 * @param {Function} [inversion_function] The function to use to invert each
 *                                       entry in the profit matrix
 *
 * @return {Array} The converted matrix
 */
function make_cost_matrix (profit_matrix, inversion_function) {
  var i, j;
  if (!inversion_function) {
    var maximum = -1.0/0.0;
    for (i = 0; i < profit_matrix.length; ++i)
      for (j = 0; j < profit_matrix[i].length; ++j)
        if (profit_matrix[i][j] > maximum)
          maximum = profit_matrix[i][j];

    inversion_function = function(x) { return maximum - x; };
  }

  var cost_matrix = [];

  for (i = 0; i < profit_matrix.length; ++i) {
    var row = profit_matrix[i];
    cost_matrix[i] = [];

    for (j = 0; j < row.length; ++j)
      cost_matrix[i][j] = inversion_function(profit_matrix[i][j]);
  }

  return cost_matrix;
}

/**
 * Convenience function: Converts the contents of a matrix of integers
 * to a printable string.
 *
 * @param {Array} matrix The matrix to print
 *
 * @return {String} The formatted matrix
 */
function format_matrix(matrix) {
  var columnWidths = [];
  var i, j;
  for (i = 0; i < matrix.length; ++i) {
    for (j = 0; j < matrix[i].length; ++j) {
      var entryWidth = String(matrix[i][j]).length;

      if (!columnWidths[j] || entryWidth >= columnWidths[j])
        columnWidths[j] = entryWidth;
    }
  }

  var formatted = '';
  for (i = 0; i < matrix.length; ++i) {
    for (j = 0; j < matrix[i].length; ++j) {
      var s = String(matrix[i][j]);

      // pad at front with spaces
      while (s.length < columnWidths[j])
        s = ' ' + s;

      formatted += s;

      // separate columns
      if (j != matrix[i].length - 1)
        formatted += ' ';
    }

    if (i != matrix[i].length - 1)
      formatted += '\n';
  }

  return formatted;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
//solveAssignmentProblem
function solveAssignmentProblem(cost_matrix, options) {
  var m = new Munkres();
  return m.compute(cost_matrix, options);
}

solveAssignmentProblem.version = "1.2.2";
solveAssignmentProblem.format_matrix = format_matrix;
solveAssignmentProblem.make_cost_matrix = make_cost_matrix;
solveAssignmentProblem.Munkres = Munkres; // backwards compatibility

if (typeof module !== 'undefined' && module.exports) {
  module.exports = solveAssignmentProblem;
}
