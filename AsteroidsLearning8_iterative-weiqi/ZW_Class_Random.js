//ZW
//AsteroidsLearning8_iterative
//ZW_Class_Random
//This is a class aka template for an object aka instance that makes seemingly random values
//but with a seed.

var ClassRandom = function(json){
  var myCounter = 0.436; //seed
	
	this.init(json);
};

ClassRandom.prototype.init = function(json){
	for(var i in json){
		this[i] = json[i];
	}
};

ClassRandom.prototype.getRandomAndChange = function() {
	this.myCounter += 0.3974;
	var result = this.myCounter % 1.0; //modulus
	return result;
};