using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Shapes;
using System.Windows.Controls;

namespace Gauge_Generator
{
    public static class Global
    {
        public const double MIN_DOUBLE_VALUE = 0.2f;
        public const double MAX_DOUBLE_VALUE = 0.8f;
        public const double MIN_RANGE_VALUE = -500f;
        public const double MAX_RANGE_VALUE = 500f;
        public const int MAX_LAYERS = 30;

        public const int ARC_LOD_LQ = 5;
        public const int ARC_LOD_HQ = 1;
        public const int MAX_ALPHA_OVERLAY = 180;
        public static Color Overlay1 { get { return Color.FromArgb(80, 66, 105, 165); } }
        
        public static ProjectData project = new ProjectData();

        public static Canvas ScreenCanvas;
        public static Layer EditingLayer;
        public static string[] LayerNames = { "Range", "Linear Scale", "Numeric Scale", "Arc", "Label", "Clock Hand" };
        public static string[] LayerDescriptions = {
            "Basic element defining size and range of values. It is required by other elements (layers)",
            "Linear Scale",
            "Numeric Scale",
            "Arc",
            "Label",
            "Clock Hand"
        };
        public static string[] LayerBigImages = {
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/range_item_big.png"
        };
        public static string[] LayerSmallImages = {
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/range_item.png"
        };

        private static Frame SidebarObject;
        private static Label SidebarTitleObject;
        public static SidebarPages Sidebar { get; private set; }

        public enum LayersType
        {
            Range = 0,
            LinearScale,
            NumericScale,
            Arc,
            Label,
            ClockHand
        }

        public enum SidebarPages
        {
            Layers = 0,
            Editor,
            ProjectSettings
        }

        public static LayersType GetLayerType(Layer obj)
        {
            if (obj is Range_Item) return LayersType.Range;
            if (obj is LinearScale_Item) return LayersType.LinearScale;
            //TODO other types
            return LayersType.Range;
        }

        public static Type GetLayerObject(LayersType obj)
        {
            switch(obj)
            {
                case LayersType.Range:
                    return typeof(Range_Item);
                case LayersType.LinearScale:
                    return typeof(LinearScale_Item);
                    //TODO other types
                default:
                    return typeof(Range_Item);
            }
        }

        public static void SetSidebarObject(Frame obj, Label lbl)
        {
            SidebarObject = obj;
            SidebarTitleObject = lbl;
        }

        public static void SetSidebar(SidebarPages newPage)
        {
            Sidebar = newPage;
            switch(Sidebar)
            {
                case SidebarPages.Layers:
                    SidebarObject.NavigationService.Navigate(new Layers_Page());
                    SidebarTitleObject.Content = "Layers";
                    break;
                case SidebarPages.Editor:
                    SidebarObject.NavigationService.Navigate(new Editor_Page());
                    SidebarTitleObject.Content = "Property editor";
                    break;
                case SidebarPages.ProjectSettings:
                    SidebarObject.NavigationService.Navigate(new Project_Settings_Page());
                    SidebarTitleObject.Content = "Project settings";
                    break;
            }
        }

        public static void RefreshScreen()
        {
            if (ScreenCanvas != null) project.DrawProject(ref ScreenCanvas, false, (int)ScreenCanvas.Width);
        }

        public static Point GetPointOnCircle(Point center, double radius, double angle)
        {
            angle = Math.PI * angle / 180.0;
            return new Point((int)(radius * Math.Cos(angle) + center.X), (int)(radius * Math.Sin(angle) + center.Y));
        }

        public static Point GetOffsetPoint(Point input, double range, double X_Offset, double Y_Offset)
        {
            return new Point((int)(input.X + X_Offset * range), (int)(input.Y + Y_Offset * range));
        }

        public static int GetLoD(bool HQmode, int radius, int angle)
        {
            int i = (int)(Math.Abs(angle) / 180.0 * Math.PI * 30 / (HQmode ? ARC_LOD_HQ : ARC_LOD_LQ));
            if (i < 2) i = 2;
            return i;
        }

        public static void DrawArc(ref Canvas obj, bool HQmode, Point center, int startAngle, int openingAngle, int radius, int weight, Color color)
        {
            int LoD = GetLoD(HQmode, radius, openingAngle);
            var ArcPoints = new Point[LoD];
            for (int i = 0; i < LoD; i++) ArcPoints[i] = GetPointOnCircle(center, radius, startAngle + (openingAngle / ((double)LoD - 1) * i));
            Polyline pl = new Polyline
            {
                StrokeThickness = weight,
                Stroke = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            for (int i = 0; i < LoD; i++) pl.Points.Add(new System.Windows.Point(ArcPoints[i].X, ArcPoints[i].Y));
            obj.Children.Add(pl);
        }

        public static void DrawCirclePart(ref Canvas obj, bool HQmode, Point center, int startAngle, int openingAngle, int radius, Color color)
        {
            int LoD = GetLoD(HQmode, radius, openingAngle);
            var ArcPoints = new Point[LoD];
            for (int i = 0; i < LoD; i++) ArcPoints[i] = GetPointOnCircle(center, radius, startAngle + (openingAngle / ((double)LoD - 1) * i));
            Polygon pg = new Polygon
            {
                StrokeThickness = 2,
                Stroke = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(color.A, color.R, color.G, color.B)),
                Fill = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            for (int i = 0; i < LoD; i++) pg.Points.Add(new System.Windows.Point(ArcPoints[i].X, ArcPoints[i].Y));
            pg.Points.Add(new System.Windows.Point(center.X, center.Y));
            obj.Children.Add(pg);
        }
    }
}
