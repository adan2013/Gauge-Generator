using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    class NumericScale_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        //PRIVATE VARIABLES
        public int _rangemin;
        public int _rangemax;
        public int _rangestep;
        public double _scalemultiplier;
        public int _rounding;
        public double _distancefromcenter;
        public double _fontsize;
        public string _fontfamily;
        public bool _bold;
        public bool _italic;
        public bool _underline;
        public MEDIA.Color _fontcolor;
        public bool _rotated;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public int RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateInt(value, RangeSource.RangeStartValue, RangeMax);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public int RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateInt(value, RangeMin, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Render frequency"), Category("Range")]
        public int RangeStep
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateInt(value, 1, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Using this number, you can modify the numerical scale values, e.g. to get value 1/2"), Category("Range")]
        public double ScaleMultiplier
        {
            get { return _scalemultiplier; }
            set { _scalemultiplier = ValidateDouble(value, 0.01, 100, false); }
        }
        [Description("Number of decimal places"), Category("Range")]
        public int Rounding
        {
            get { return _rounding; }
            set { _rounding = ValidateInt(value, 0, 2); }
        }
        [Description("Distance between center of labels and center of the clock face"), Category("Position")]
        public double DistanceFromCenter
        {
            get { return TranslateValue(_distancefromcenter); }
            set { _distancefromcenter = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("Rotate text around the center"), Category("Position")]
        public bool Rotated
        {
            get { return _rotated; }
            set { _rotated = value; }
        }
        [Description("Font color"), Category("Font")]
        public MEDIA.Color FontColor
        {
            get { return _fontcolor; }
            set { _fontcolor = ValidateColor(value, false); }
        }
        [Description("Font size"), Category("Font")]
        public double FontSize
        {
            get { return TranslateValue(_fontsize); }
            set { _fontsize = ValidateDouble(value, 0.05, 0.2); }
        }
        [Description("Font family"), Category("Font")]
        public string FontFamily
        {
            get { return _fontfamily; }
            set { _fontfamily = ValidateFontFamily(value); }
        }
        [Description("Font modifier: bold"), Category("Font")]
        public bool Bold
        {
            get { return _bold; }
            set { _bold = value; }
        }
        [Description("Font modifier: italic"), Category("Font")]
        public bool Italic
        {
            get { return _italic; }
            set { _italic = value; }
        }
        [Description("Font modifier: underline"), Category("Font")]
        public bool Underline
        {
            get { return _underline; }
            set { _underline = value; }
        }

        public NumericScale_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _rangemin = 0;
            _rangemax = 100;
            _rangestep = 10;
            _scalemultiplier = 1;
            _rounding = 0;
            _distancefromcenter = 0.85;
            _fontcolor = MEDIA.Colors.White;
            _fontsize = 0.1;
            _fontfamily = Global.DEFAULT_FONT;
            _bold = false;
            _italic = false;
            _underline = false;
            ValidateWithSource();
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original)
        {
            base.CloneCreator(original);
            NumericScale_Item o = (NumericScale_Item)original;
            _rangemin = o._rangemin;
            _rangemax = o._rangemax;
            _rangestep = o._rangestep;
            _scalemultiplier = o._scalemultiplier;
            _rounding = o._rounding;
            _distancefromcenter = o._distancefromcenter;
            _fontcolor = o._fontcolor;
            _fontsize = o._fontsize;
            _fontfamily = o._fontfamily;
            _bold = o._bold;
            _italic = o._italic;
            _underline = o._underline;
        }

        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _rangemin = obj._rangestartvalue;
            _rangemax = obj._rangeendvalue;
            RangeStep = (_rangemax - _rangemin) / DEFAULT_STEP_PARTS;
        }

        public override void ValidateWithSource()
        {
            if (RangeSource != null)
            {
                _rangemin = ValidateInt(_rangemin, RangeSource._rangestartvalue, _rangemax);
                _rangemax = ValidateInt(_rangemax, _rangemin, RangeSource._rangeendvalue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            if (RangeSource._openingangle != 0 && _rangemax - _rangemin != 0)
            {
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
                double circle = _distancefromcenter * RangeSource._circleradius * half_size;
                int fsize = (int)(_fontsize * half_size);
                for (int i = _rangemin; i <= _rangemax; i += _rangestep)
                {
                    double ang = i / (double)RangeSource._rangeendvalue * RangeSource._openingangle + RangeSource._anglestart;
                    string s = string.Format(GetStringFormat(), i * _scalemultiplier);
                    Global.DrawString(ref can,
                                      Global.GetPointOnCircle(c, circle, ang),
                                      fsize,
                                      _fontfamily,
                                      _bold,
                                      _italic,
                                      _underline,
                                      s,
                                      _fontcolor,
                                      _rotated ? ang + 90 : 0);
                }
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            Shape s = Global.DrawArc(ref can,
                                     false,
                                     c,
                                     (int)Math.Round(_rangemin / (double)RangeSource._rangeendvalue * RangeSource._openingangle + RangeSource._anglestart),
                                     (int)Math.Round((_rangemax - _rangemin) / (double)RangeSource._rangeendvalue * RangeSource._openingangle),
                                     (int)Math.Round(_distancefromcenter * RangeSource._circleradius * half_size),
                                     5,
                                     Global.Overlay1);
            Global.AddOpacityAnimation(s);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }

        private string GetStringFormat()
        {
            switch(_rounding)
            {
                case 0: return "{0:0}";
                case 1: return "{0:0.0}";
                case 2: return "{0:0.00}";
                default: return "";
            }
        }
    }
}
