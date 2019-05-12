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
    class Arc_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        //PRIVATE VARIABLES
        public double _circleoffset_x;
        public double _circleoffset_y;
        public double _circleradius;
        public int _anglestart;
        public int _openingangle;
        public MEDIA.Color _color;
        public double _weight;

        //PROPERTIES
        [Description("X coordinate of the center of circle"), Category("Position")]
        public double CircleOffset_X
        {
            get { return TranslateValue(_circleoffset_x); }
            set { _circleoffset_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of circle"), Category("Position")]
        public double CircleOffset_Y
        {
            get { return TranslateValue(_circleoffset_y); }
            set { _circleoffset_y = ValidateDouble(value, -1, 1); }
        }
        [Description("Radius of the circle"), Category("Position")]
        public double CircleRadius
        {
            get { return TranslateValue(_circleradius); }
            set { _circleradius = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("Start angle"), Category("Arc")]
        public int AngleStart
        {
            get { return _anglestart; }
            set { _anglestart = ValidateInt(value, 0, 360); }
        }
        [Description("Opening angle"), Category("Arc")]
        public int OpeningAngle
        {
            get { return _openingangle; }
            set { _openingangle = ValidateInt(value, -360, 360); }
        }
        [Description("Color of the arc"), Category("Arc")]
        public MEDIA.Color Color
        {
            get { return _color; }
            set { _color = ValidateColor(value, true); }
        }
        [Description("Arc weight"), Category("Arc")]
        public double Weight
        {
            get { return TranslateValue(_weight); }
            set { _weight = ValidateDouble(value, 0.01, 1); }
        }

        public Arc_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _circleoffset_x = 0;
            _circleoffset_y = 0;
            _circleradius = 0.5;
            _anglestart = 0;
            _openingangle = 90;
            _color = MEDIA.Colors.Red;
            _weight = 0.2;
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original)
        {
            base.CloneCreator(original);
            Arc_Item o = (Arc_Item)original;
            _circleoffset_x = o._circleoffset_x;
            _circleoffset_y = o._circleoffset_y;
            _circleradius = o._circleradius;
            _anglestart = o._anglestart;
            _openingangle = o._openingangle;
            _color = o._color;
            _weight = o._weight;
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            if (_openingangle != 0)
            {
                int half_size = size / 2;
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
                c = Global.GetOffsetPoint(c, half_size, _circleoffset_x, _circleoffset_y);
                double circle1 = Math.Max(0.0, _circleradius - _weight) * RangeSource._circleradius * half_size;
                double circle2 = _circleradius * RangeSource._circleradius * half_size;
                Global.DrawPolygonArc(ref can,
                                      HQmode,
                                      c,
                                      _anglestart,
                                      _openingangle,
                                      circle1,
                                      circle2,
                                      System.Drawing.Color.FromArgb(_color.A, _color.R, _color.G, _color.B));
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            //int half_size = size / 2;
            //Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            //Point l = new Point((int)Math.Round(c.X + _position_x * half_size), (int)Math.Round(c.Y + _position_y * half_size));

            //Shape s1 = Global.DrawLine(ref can,
            //                           new Point(l.X, 0),
            //                           new Point(l.X, size),
            //                           5,
            //                           Global.Overlay1);
            //Shape s2 = Global.DrawLine(ref can,
            //                           new Point(0, l.Y),
            //                           new Point(size, l.Y),
            //                           5,
            //                           Global.Overlay1);
            //Global.AddOpacityAnimation(s1);
            //Global.AddOpacityAnimation(s2);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
