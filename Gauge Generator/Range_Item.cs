using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;

namespace Gauge_Generator
{
    class Range_Item : Layer
    {
        //PRIVATE VARIABLES
        float _circlecenter_x = 0;
        float _circlecenter_y = 0;
        float _circleradius = 1;
        int _anglestart = 160;
        int _anglelength = 220;
        float _rangestartvalue = 0;
        float _rangeendvalue = 100;
        float _gaugeoffset_x = 0;
        float _gaugeoffset_y = 0;
        float _gaugepointsize = 0.05f;
        Color _gaugepointcolor = Colors.White;

        //PROPERTIES
        public float CircleCenter_X
        {
            get { return _circlecenter_x; }
            set { _circlecenter_x = ValidateFloat(value, -1, 1); }
        }
        public float CircleCenter_Y
        {
            get { return _circlecenter_y; }
            set { _circlecenter_y = ValidateFloat(value, -1, 1); }
        }
        public float CircleRadius
        {
            get { return _circleradius; }
            set { _circleradius = ValidateFloat(value, Global.MIN_FLOAT_VALUE, 1); }
        }
        public int AngleStart
        {
            get { return _anglestart; }
            set { _anglestart = ValidateInt(value, 0, 360); }
        }
        public int AngleLength
        {
            get { return _anglelength; }
            set { _anglelength = ValidateInt(value, -360, 360); }
        }
        public float RangeStartValue
        {
            get { return _rangestartvalue; }
            set { _rangestartvalue = ValidateFloat(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE); }
        }
        public float RangeEndValue
        {
            get { return _rangeendvalue; }
            set { _rangeendvalue = ValidateFloat(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE); }
        }
        public float GaugeOffset_X
        {
            get { return _gaugeoffset_x; }
            set { _gaugeoffset_x = ValidateFloat(value, -Global.MAX_FLOAT_VALUE, Global.MAX_FLOAT_VALUE); }
        }
        public float GaugeOffset_Y
        {
            get { return _gaugeoffset_y; }
            set { _gaugeoffset_y = ValidateFloat(value, -Global.MAX_FLOAT_VALUE, Global.MAX_FLOAT_VALUE); }
        }
        public float GaugePointSize
        {
            get { return _gaugepointsize; }
            set { _gaugepointsize = ValidateFloat(value, 0.01f, 0.1f); }
        }
        public Color GaugePointColor
        {
            get { return _gaugepointcolor; }
            set { _gaugepointcolor = ValidateColor(value, true); }
        }

        public override void DrawLayer(ref DrawingContext dc, int size)
        {
            base.DrawLayer(ref dc, size);
        }

        public override void DrawOverlay(ref DrawingContext dc, int size, float alpha)
        {
            base.DrawOverlay(ref dc, size, alpha);
        }
    }
}
