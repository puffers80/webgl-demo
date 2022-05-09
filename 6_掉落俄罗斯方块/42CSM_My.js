var gl;				// WebGL上下文
var u_MVPMatrix;    // shader中uniform变量u_MVPMatrix的索引
var u_StartColor;   // shader中uniform变量u_StartColor的索引
var u_EndColor;   	// shader中uniform变量u_EndColor的索引
var matProj;		// 投影矩阵，在main中赋值，在render中使用
var matMVP;			// 模视投影矩阵
var angleY = 0.0;	// 绕y轴旋转的角度
var angleX = 0.0;	// 绕x轴旋转的角度

var angleStep = 3.0;// 角度变化
var nVertexCountPerSide = 50;//正方形细分后每行顶点数
var nVertexCount = nVertexCountPerSide * nVertexCountPerSide;//一个面的顶点数
// 一个面的三角形数
var nTriangleCount=(nVertexCountPerSide-1)*(nVertexCountPerSide-1)*2;
var nIndexCount = 3 * nTriangleCount //一个面的顶点索引数
var count = 0;
var y = 10;
window.onload = function main(){
    var canvas = document.getElementById("webgl");
	if(!canvas){
		alert("获取canvas元素失败！"); 
		return;
	}
    gl = WebGLUtils.setupWebGL(canvas);    
    if (!gl){
		alert("获取WebGL上下文失败！"); 
		return;
	}        

    gl.clearColor(0.8, 0.8, 0.8, 1.0); // 设置背景色
	gl.enable(gl.DEPTH_TEST);	// 开启深度检测
	gl.enable(gl.CULL_FACE);	// 开启面剔除，默认剔除背面
	gl.viewport(0, 0, canvas.width, canvas.height);
	// 设置投影矩阵：透视投影，根据视口宽高比指定视域体
	matProj = perspective(35.0, 		// 垂直方向视角
		canvas.width / canvas.height, 	// 视域体宽高比
		20.0, 							// 相机到近裁剪面距离
		100.0);							// 相机到远裁剪面距离

	var vertices = [];//顶点坐标数组
	//x和y方向相邻顶点间距
	var step = 1.0 / (nVertexCountPerSide - 1);   
	var y = 0.5;//初始y坐标
	for (var i = 0; i < nVertexCountPerSide; i++) {
		var x = -0.5;//初始x坐标
		for (var j = 0; j < nVertexCountPerSide; j++) {
			vertices.push(vec2(x, y));
			x += step;
		}
		y -= step;
	}
	
	/*索引数组*/
	var indexes = new Uint16Array(nIndexCount);
	var index = 0;//indexes数组下标
	var start = 0;//初始索引
	for (var i = 0; i < nVertexCountPerSide - 1; i++) {
		for (var j = 0; j < nVertexCountPerSide - 1; j++) {
		//添加构成一个小正方形的两个三角形的顶点索引
			indexes[index++] = start;
			indexes[index++] = start + nVertexCountPerSide;
			indexes[index++] = start + nVertexCountPerSide + 1;
			indexes[index++] = start;
			indexes[index++] = start + nVertexCountPerSide + 1;
			indexes[index++] = start + 1;
			start++;
		}
		start++;
	}

    var verticesBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	var indexBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferId);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW );
	
    var program = initShaders(gl, "vertex-shader", 
		"fragment-shader");
    gl.useProgram(program);
	
    var a_Position = gl.getAttribLocation(program, "a_Position");
	if(a_Position < 0){
		alert("获取attribute变量a_Position失败！"); 
		return;
	}
	
    gl.vertexAttribPointer(a_Position, 	// shader attribute变量位置
		2, // 每个顶点属性有2个分量
		gl.FLOAT, // 数组数据类型(浮点型)
		false, 	  // 不进行归一化处理
		0,	 	  // 相邻顶点属性首址间隔(0为紧密排列) 
		0);		  // 第一个顶点属性在Buffer中偏移量
    gl.enableVertexAttribArray(a_Position);  // 启用顶点属性数组

	u_MVPMatrix = gl.getUniformLocation(program, "u_MVPMatrix");
	if(!u_MVPMatrix){
		alert("获取uniform变量u_MVPMatrix失败！")
		return;
	}
	var u_MaxDist = gl.getUniformLocation(program, "u_MaxDist");
	if(!u_MaxDist){
		alert("获取uniform变量u_MaxDist失败！")
		return;
	}
	u_StartColor = gl.getUniformLocation(program, "u_StartColor");
	if(!u_StartColor){
		alert("获取uniform变量u_StartColor失败！")
		return;
	}
	u_EndColor = gl.getUniformLocation(program, "u_EndColor");
	if(!u_EndColor){
		alert("获取uniform变量u_EndColor失败！")
		return;
	}
	
	/*u_MaxDist的值在整个程序执行过程中不变，
	  因此可在main中为其传值*/
	// 正方形内一点到正方形中心的最大距离
	gl.uniform1f(u_MaxDist, Math.sqrt(2.0) / 2); 
	
	//进行绘制
    render();
};

//按键响应
window.onkeydown = function(){
	switch(event.keyCode){
		case 37://方向键Left
			angleY -= angleStep;
			if (angleY < -180.0) {
				angleY += 360.0;
			}
			break;
		case 38://方向键Up
			angleX -= angleStep;
			if (angleX < -80.0) {
				angleX = -80.0;
			}
			break;
		case 39://方向键Right
			angleY += angleStep;
			if (angleY > 180.0) {
				angleY -= 360.0;
			}
			break;
		case 40://方向键Down
			angleX += angleStep;
			if (angleX > 80.0) {
				angleX = 80.0;
			}
			break;
	}
}
	
// 记录上一次调用函数的时刻
var last = Date.now();

// 根据时间更新旋转角度
function animation(){
	// 计算距离上次调用经过多长的时间
	var now = Date.now();
	var elapsed = now - last; // 毫秒
	last = now;
	if(y=>10)
		y-=0.5;
	if(y<-2){
		y=10;
		count++;
	}

}

// 绘制函数
function render() {
	animation();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	matMVP = matProj;	// 初始化为投影矩阵
	matMVP = mult(matMVP, translate(0.0, 0.0, -60.0));
	matMVP = mult(matMVP, mult(rotateY(angleY), rotateX(angleX)));
	heart(y,count);
	if(count >= 1){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(-2,-8,0),scale(2,2,2)));}
	if(count >= 2){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(2,-6,0),scale(2,2,2)));}
	if(count >= 3){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.8,0.8,0,1);
	Z(mult(translate(-4,-6,0),scale(2,2,2)));}
	if(count >= 4){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(0,-4,0),mult(rotateY(180),scale(2,2,2))));}
	if(count >= 5){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0,0.9,1);
	squre4(mult(translate(-8,-2,0),scale(2,2,2)));}
	if(count >= 6){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(-8,0,0),scale(2,2,2)));}
	if(count >= 7){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(-4,0,0),mult(mult(rotateZ(90),rotateX(180)),scale(2,2,2))));}
	if(count >= 8){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(4,-2,0),mult(rotateX(180),scale(2,2,2))));}
	if(count >= 9){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(8,0,0),mult(rotateZ(90),scale(2,2,2))));}	
	if(count >= 10){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(4,0,0),mult(rotateY(180),scale(2,2,2))));}
	if(count >= 11){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(2,2,0),mult(rotateZ(90),scale(2,2,2))));}
	if(count >= 12){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(4,4,0),scale(2,2,2)));}
	if(count >= 13){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(-6,4,0),mult(rotateY(180),scale(2,2,2))));}
	if(count >= 14){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(-2,6,0),mult(rotateZ(-90),scale(2,2,2))));}
	if(count==20)
		count=0;
	requestAnimFrame(render); // 请求重绘
}

function heart(y,count){
	if(count == 0){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(-2,-6+y,0),scale(2,2,2)));}
	if(count == 1){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(2,-4+y,0),scale(2,2,2)));}
	if(count == 2){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.8,0.8,0,1);
	Z(mult(translate(-4,-4+y,0),scale(2,2,2)));}
	if(count == 3){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(0,-2+y,0),mult(rotateY(180),scale(2,2,2))));}
	if(count == 4){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0,0.9,1);
	squre4(mult(translate(-8,0+y,0),scale(2,2,2)));}
	if(count == 5){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(-8,2+y,0),scale(2,2,2)));}
	if(count == 6){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(-4,2+y,0),mult(mult(rotateZ(90),rotateX(180)),scale(2,2,2))));}
	if(count == 7){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(4,0+y,0),mult(rotateX(180),scale(2,2,2))));}
	if(count == 8){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(8,2+y,0),mult(rotateZ(90),scale(2,2,2))));}
	if(count == 9){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(4,2+y,0),mult(rotateY(180),scale(2,2,2))));}
	if(count == 10){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.9,0.6,0.2,1);
	L(mult(translate(2,4+y,0),mult(rotateZ(90),scale(2,2,2))));}
	if(count == 11){
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,1,0,0,1);
	squre2(mult(translate(4,6+y,0),scale(2,2,2)));}
	if(count == 12){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0.2,1,0.2,1);
	Z(mult(translate(-6,6+y,0),mult(rotateY(180),scale(2,2,2))));}
	if(count == 13){	
	gl.uniform4f(u_StartColor,1,1,1,1);
	gl.uniform4f(u_EndColor,0,0,1,1);
	tu(mult(translate(-2,8+y,0),mult(rotateZ(-90),scale(2,2,2))));}
}

function L(matInstance){//L
	var matNew = mult(matMVP, matInstance);
	for(var x=0;x<3;x++){
		//前面
		gl.uniformMatrix4fv(u_MVPMatrix, false, 
			flatten(mult(matNew,translate(x,0,0.5))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//后面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, 0, -0.5), rotateX(180)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//下面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, -0.5, 0), rotateX(90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	}
	//左面y=0
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-0.5, 0, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//右面y=0
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(3-0.5, 0, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//y=1
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(0, 1, 0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 1, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-0.5, 1, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0.5, 1, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//上面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 1.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, 0.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(2, 0.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
}

function Z(matInstance){//Z
	var matNew = mult(matMVP, matInstance);
	//前面
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(0,0,0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(1,0,0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(0, 1, 0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(-1, 1, 0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//后面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 0, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, 0, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 1, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-1, 1, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//下面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, -0.5, 0), rotateX(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, -0.5, 0), rotateX(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-1, 0.5, 0), rotateX(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//上面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 1.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-1, 1.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, 0.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//左面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-0.5, 0, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-1.5, 1, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//右面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1.5, 0, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0.5, 1, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
}

function tu(matInstance){//凸
	var matNew = mult(matMVP, matInstance);
	for(var x=0;x<3;x++){
		//前面
		gl.uniformMatrix4fv(u_MVPMatrix, false, 
			flatten(mult(matNew,translate(x,0,0.5))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//后面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, 0, -0.5), rotateX(180)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//下面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, -0.5, 0), rotateX(90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	}
	//左面y=0
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-0.5, 0, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//右面y=0
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(3-0.5, 0, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//y=1
	gl.uniformMatrix4fv(u_MVPMatrix, false, 
		flatten(mult(matNew,translate(1, 1, 0.5))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, 1, -0.5), rotateX(180)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0.5, 1, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1.5, 1, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	//上面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(0, 0.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(1, 1.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(2, 0.5, 0), rotateX(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
}

function squre2(matInstance){//方块
	var matNew = mult(matMVP, matInstance);
	for(var x=0;x<2;x++){
		for(var y=0;y<2;y++){
		//前面
		gl.uniformMatrix4fv(u_MVPMatrix, false, 
			flatten(mult(matNew,translate(x,y,0.5))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//后面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, y, -0.5), rotateX(180)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		}
		//上面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, 1.5, 0), rotateX(-90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//下面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, -0.5, 0), rotateX(90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//左面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(-0.5, x, 0), rotateY(-90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
		//右面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(2-0.5, x, 0), rotateY(90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	}
}

function squre4(matInstance){//口口口口
	var matNew = mult(matMVP, matInstance);
	for(var x=0;x<4;x++){
		//前面
		gl.uniformMatrix4fv(u_MVPMatrix, false, 
			flatten(mult(matNew,translate(x,0,0.5))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//后面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, 0, -0.5), rotateX(180)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//上面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, 0.5, 0), rotateX(-90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
		//下面
		gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
			mult(matNew, mult(translate(x, -0.5, 0), rotateX(90)))));
		gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
	}
	//左面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(-0.5, 0, 0), rotateY(-90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);	
	//右面
	gl.uniformMatrix4fv(u_MVPMatrix, false, flatten(
		mult(matNew, mult(translate(4-0.5, 0, 0), rotateY(90)))));
	gl.drawElements(gl.TRIANGLES,nIndexCount,gl.UNSIGNED_SHORT,0);
}



