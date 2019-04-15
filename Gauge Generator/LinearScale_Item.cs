using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;

namespace Gauge_Generator
{
    public class LinearScale_Item : Layer
    {
        //PRIVATE VARIABLES
        float _rangemin = 0;
        float _rangemax = 100;
        float _rangetick = 20;
        int _lineweight = 2;
        float _distancefromcenter = 1;
        float _linelength = 0.2f;
        Color _linecolor = Colors.White;

        //PROPERTIES
        public float RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateFloat(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                _rangemin = ValidateFloat(_rangemin, RangeSource.RangeStartValue, RangeMax);
            }
        }
        public float RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateFloat(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                _rangemax = ValidateFloat(_rangemax, RangeMin, RangeSource.RangeEndValue);
            }
        }
        public float Tick
        {
            get { return _rangetick; }
            set { _rangetick = ValidateFloat(value, Global.MIN_FLOAT_VALUE, Global.MAX_RANGE_VALUE); }
        }
        public int LineWeight
        {
            get { return _lineweight; }
            set { _lineweight = ValidateInt(value, 1, 50); }
        }
        public float DistanceFromCenter
        {
            get { return _distancefromcenter; }
            set { _distancefromcenter = ValidateFloat(value, 0, 1); }
        }
        public float LineLength
        {
            get { return _linelength; }
            set { _linelength = ValidateFloat(value, 0, 1); }
        }
        public Color LineColor
        {
            get { return _linecolor; }
            set { _linecolor = ValidateColor(value, false); }
        }

        //METHODS
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
