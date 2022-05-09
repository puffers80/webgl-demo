//实验二 42CSM_2DRecursive 分形图形绘制
var NumTimesToSubdivide = 5;//递归次数
var NumTriangles = Math.pow(3, NumTimesToSubdivide);//产生的三角形个数
var NumVertices = 3 * NumTriangles;//顶点数
var points = [];//存放顶点坐标的数组，初始为空
window.onload = function main(){
	var canvas = document.getElementById("webgl");
	if(!canvas){
		alert("获取canvas元素失败！");
		return;
	}
	var gl = WebGLUtils.setupWebGL(canvas);
	if(!gl){
		alert("获取WebGL上下文失败！");
		return;
	}
	var  vertices = [
		vec2(-1.0, -1.0), vec2(0.0, 1.0), vec2(1.0, -1.0)
	];
	divideTriangle(vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);
	
	gl.viewport(0, 0, canvas.width,canvas.height);
	gl.clearColor(0.0, 1.0, 1.0, 1.0);
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	var verticesBufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,verticesBufferId);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(program,"a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！");
		return;
	}
	gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);	
	gl.enableVertexAttribArray(a_Position);
	render(gl);
};

function render(gl){
	gl.clear(gl.COLOR_BUFFER_BIT);//用背景色擦除窗口内容
	//使用顶点数组进行绘制
	gl.drawArrays(gl.TRIANGLES,0,NumVertices);
}

function triangle(a, b, c){
	points.push(a);
	points.push(b);
	points.push(c);
}

function divideTriangle(a, b, c, k){
	if(k > 0){
		var ab = mult(0.5, add(a, b));
		var ac = mult(0.5, add(a, c));
		var bc = mult(0.5, add(b, c));
		divideTriangle(a, ab, ac, k - 1);
		divideTriangle(c, ac, bc, k - 1);
		divideTriangle(b, bc, ab, k - 1);
	}
	else{
		triangle(a, b, c);
	}
}



